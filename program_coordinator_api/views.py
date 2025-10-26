import io
import openpyxl
from django.http import JsonResponse, HttpResponse
from django.db import transaction
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from base.models import FacultyResponsibility
from student.models import (
    Student,
    TrainingAttendanceSemester,
    TrainingPerformanceSemester,
)
from .models import TrainingPerformance, TrainingPerformanceCategory  # assuming you added these
from django.conf import settings

# --- training config (single source of truth for subcategories) ---
TRAINING_CONFIG = {
    "Aptitude": [
        "Arithmetic",
        "Logical Reasoning",
        "Probability",
        "Verbal Ability",
        "Verbal Reasoning",
    ],
    "Technical": ["OS", "DBMS", "DSA", "CN", "OOPS"],
    "Coding": ["Coding Marks"],
}

# base headers expected for every template (order matters)
BASE_HEADERS = ["UID", "Full Name", "Branch_Div", "Year", "Semester"]


# Helper: normalize header string
def _normalize_header(h):
    if h is None:
        return ""
    return str(h).strip()


# -------------------------
# GET headers for a training type
# -------------------------
@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_training_headers(request, training_type: str):
    """
    Return the expected header list for the requested training_type (Aptitude/Technical/Coding).
    """
    training_type = str(training_type).strip()
    if training_type not in TRAINING_CONFIG:
        return JsonResponse({"error": "Unknown training_type", "valid_types": list(TRAINING_CONFIG.keys())}, status=400)

    headers = BASE_HEADERS + TRAINING_CONFIG[training_type]
    return JsonResponse({"training_type": training_type, "headers": headers})


# -------------------------
# GET template Excel for a training type
# -------------------------
@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def download_training_template(request, training_type: str):
    """
    Dynamically generate an Excel template for the training_type and return it as a downloadable file.
    """
    training_type = str(training_type).strip()
    if training_type not in TRAINING_CONFIG:
        return JsonResponse({"error": "Unknown training_type", "valid_types": list(TRAINING_CONFIG.keys())}, status=400)

    # Permission check: only ProgramCoordinator (or staff)
    user = request.user
    try:
        is_coordinator = user.is_staff or user.groups.filter(name="ProgramCoordinator").exists()
    except Exception:
        is_coordinator = user.is_staff

    if not is_coordinator:
        return JsonResponse({"error": "Permission denied. Program coordinators only."}, status=403)

    headers = BASE_HEADERS + TRAINING_CONFIG[training_type]

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"{training_type}_Template"
    ws.append(headers)

    # add one sample row (you may adapt sample data)
    sample_row = ["101", "John Doe", "CSE_A", 2025, "SEM-1"]
    # add a sample mark value for each subcategory
    sample_row += [75 for _ in TRAINING_CONFIG[training_type]]
    ws.append(sample_row)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"training_template_{training_type}.xlsx"
    response = HttpResponse(output.read(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


# -------------------------
# POST upload handler
# -------------------------
@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_training_performance(request):
    """
    Accepts multipart/form-data with fields:
      - file: uploaded Excel (.xlsx)
      - training_type: e.g., 'Aptitude' (required)
      - optional: semester, year (but prefer values in file)
    Parses, validates, and stores TrainingPerformance + TrainingPerformanceCategory rows.
    Returns summary and row-level errors.
    """
    user = request.user

    # Permission check: only ProgramCoordinator (or staff)
    try:
        is_coordinator = user.is_staff or user.groups.filter(name="ProgramCoordinator").exists()
    except Exception:
        is_coordinator = user.is_staff

    if not is_coordinator:
        return JsonResponse({"error": "Permission denied. Program coordinators only."}, status=403)

    training_type = request.POST.get("training_type", None)
    if not training_type:
        return JsonResponse({"error": "training_type is required in POST body (Aptitude/Technical/Coding)."}, status=400)

    training_type = str(training_type).strip()
    if training_type not in TRAINING_CONFIG:
        return JsonResponse({"error": "Unknown training_type", "valid_types": list(TRAINING_CONFIG.keys())}, status=400)

    file = request.FILES.get("file", None)
    if not file:
        return JsonResponse({"error": "No file uploaded (form field 'file')."}, status=400)

    # Accept only Excel
    if not (file.name.endswith(".xlsx") or file.name.endswith(".xls")):
        return JsonResponse({"error": "Invalid file format. Please upload an .xlsx file."}, status=400)

    expected_headers = BASE_HEADERS + TRAINING_CONFIG[training_type]

    try:
        wb = openpyxl.load_workbook(file, data_only=True)
        sheet = wb.active

        # read header row (first row)
        header_cells = next(sheet.iter_rows(min_row=1, max_row=1, values_only=False))
        read_headers = [_normalize_header(c.value) for c in header_cells]

        # trim read_headers to expected length (in case sheet has extra cols)
        read_headers_trim = read_headers[: len(expected_headers)]

        # Check header match exactly (order + names)
        if read_headers_trim != expected_headers:
            return JsonResponse({
                "error": "Invalid header format for chosen training_type.",
                "training_type": training_type,
                "expected": expected_headers,
                "found_prefix": read_headers_trim
            }, status=400)

        errors = []
        processed = 0
        created_tp = 0
        updated_tp = 0
        created_cat = 0
        updated_cat = 0

        # We'll parse all rows first into memory for validation, then write in a transaction
        parsed_rows = []
        for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            # make sure row has at least base header columns
            row_list = list(row)
            # pad row_list so indexing won't fail
            if len(row_list) < len(expected_headers):
                row_list += [None] * (len(expected_headers) - len(row_list))

            uid = row_list[0]
            full_name = row_list[1]
            branch_div = row_list[2]
            year = row_list[3]
            semester = row_list[4]
            sub_vals = row_list[5: 5 + len(TRAINING_CONFIG[training_type])]

            row_errs = []
            if uid is None or str(uid).strip() == "":
                row_errs.append("UID is required.")
            if full_name is None or str(full_name).strip() == "":
                row_errs.append("Full Name is required.")
            if branch_div is None or str(branch_div).strip() == "":
                row_errs.append("Branch_Div is required.")
            if year is None:
                row_errs.append("Year is required.")
            else:
                # coerce to int if possible
                try:
                    year_val = int(year)
                except Exception:
                    row_errs.append("Year must be an integer.")
            if semester is None or str(semester).strip() == "":
                row_errs.append("Semester is required.")

            # validate subcategory marks
            sub_marks = []
            for j, val in enumerate(sub_vals):
                cat_name = TRAINING_CONFIG[training_type][j]
                if val is None or str(val).strip() == "":
                    row_errs.append(f"Marks required for category '{cat_name}'.")
                else:
                    try:
                        m = float(val)
                        # optionally enforce 0-100
                        if m < 0 or m > 100:
                            row_errs.append(f"Marks out of range (0-100) for '{cat_name}'.")
                        sub_marks.append((cat_name, m))
                    except Exception:
                        row_errs.append(f"Marks must be numeric for '{cat_name}'.")

            if row_errs:
                errors.append({"row": row_idx, "errors": row_errs})
            else:
                parsed_rows.append({
                    "row": row_idx,
                    "uid": str(uid).strip(),
                    "full_name": str(full_name).strip(),
                    "branch_div": str(branch_div).strip(),
                    "year": int(year),
                    "semester": str(semester).strip(),
                    "sub_marks": sub_marks,
                })

        # If you prefer to abort on any error, uncomment this block:
        # if errors:
        #     return JsonResponse({"error": "Validation errors found.", "errors": errors}, status=400)

        # Now write to DB in a transaction
        with transaction.atomic():
            for item in parsed_rows:
                uid = item["uid"]
                semester = item["semester"]
                # update_or_create TrainingPerformance
                tp_defaults = {
                    "full_name": item["full_name"],
                    "branch_div": item["branch_div"],
                    "year": item["year"],
                    "uploaded_by_id": user.pk if user and user.is_authenticated else None,
                }
                tp_obj, created_flag = TrainingPerformance.objects.update_or_create(
                    uid=uid,
                    training_type=training_type,
                    semester=semester,
                    defaults=tp_defaults
                )
                if created_flag:
                    created_tp += 1
                else:
                    updated_tp += 1

                processed += 1

                # Now for each subcategory, update_or_create category rows
                for cat_name, marks in item["sub_marks"]:
                    cat_defaults = {"marks": marks}
                    cat_obj, cat_created_flag = TrainingPerformanceCategory.objects.update_or_create(
                        performance=tp_obj,
                        category_name=cat_name,
                        defaults=cat_defaults
                    )
                    if cat_created_flag:
                        created_cat += 1
                    else:
                        updated_cat += 1

        resp = {
            "message": "Upload processed",
            "training_type": training_type,
            "processed_rows": processed,
            "created_training_performance": created_tp,
            "updated_training_performance": updated_tp,
            "created_category_rows": created_cat,
            "updated_category_rows": updated_cat,
            "errors_count": len(errors),
            "errors": errors
        }
        status_code = 201 if len(errors) == 0 else 207
        return JsonResponse(resp, status=status_code)

    except openpyxl.utils.exceptions.InvalidFileException:
        return JsonResponse({"error": "Invalid Excel file; cannot read."}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_attendance_data(request, table_name):
    try:
        # Validate table_name to prevent SQL injection
        valid_tables = [
            "attendance_data",
            "another_table",
        ]  # Add valid table names here
        if table_name not in valid_tables:
            return JsonResponse({"error": "Invalid table name"}, status=400)

        # Construct query with dynamic table name
        query = f"""
            SELECT batch, late, name, present, program_name, session, timestamp, uid, year
            FROM {table_name}
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            # Convert the rows into a list of dictionaries
            columns = [col[0] for col in cursor.description]
            result = [dict(zip(columns, row)) for row in rows]

        return JsonResponse(result, safe=False)

    except Exception as e:
        return JsonResponse(
            {"error": f"Failed to fetch attendance data: {str(e)}"}, status=500
        )


import logging
from django.db import connection, IntegrityError, DatabaseError
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

# Setup logger
logger = logging.getLogger(__name__)

@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def save_branch_attendance(request, table_name):
    if request.method == "POST":
        try:
            # Validate table_name to prevent SQL injection
            valid_tables = [
                "batch_attendance",
                "another_batch_table",
            ]  # Add valid table names here
            if table_name not in valid_tables:
                return JsonResponse({"error": "Invalid table name"}, status=400)
            
            branch_data = request.data.get("branchData")
            if not branch_data:
                return JsonResponse({"error": "No data provided"}, status=400)

            for batch in branch_data:
                batch_name = batch["batch"]
                program_name = batch["program_name"]
                year = batch["year"]
                total_students = batch.get("totalStudents", 0)
                total_present = batch.get("totalPresent", 0)
                total_absent = batch.get("totalAbsent", 0)
                total_late = batch.get("totalLate", 0)

                # Validate each session in batch
                for session, session_data in batch.items():
                    # Skip non-session fields
                    if session in ["batch", "program_name", "year", "totalStudents", "totalPresent", "totalAbsent", "totalLate"]:
                        continue
                    
                    # Ensure session data has a 'date'
                    if 'date' not in session_data:
                        logger.warning(f"Date is missing for session {session} in batch {batch_name}")
                        return JsonResponse({"error": f"Date is missing for session {session}"}, status=400)

                    # Get the date from session data
                    session_date = session_data.get('date')

                    # Format the session as "date - session"
                    session_name = f"{session_date} - {session}"

                    # Insert or update batch attendance via raw SQL
                    query = f"""
                        INSERT INTO {table_name} (batch, session, program_name, year, total_students, total_present, total_absent, total_late)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            total_students = VALUES(total_students),
                            total_present = VALUES(total_present),
                            total_absent = VALUES(total_absent),
                            total_late = VALUES(total_late)
                    """
                    try:
                        with connection.cursor() as cursor:
                            cursor.execute(
                                query,
                                (
                                    batch_name,
                                    session_name,  # Use the formatted session name
                                    program_name,
                                    year,
                                    total_students,
                                    total_present,
                                    total_absent,
                                    total_late,
                                ),
                            )
                    except IntegrityError as e:
                        logger.error(f"Integrity error while saving data for batch {batch_name}, session {session_name}: {str(e)}")
                        return JsonResponse({"error": f"Database Integrity Error: {str(e)}"}, status=500)
                    except DatabaseError as e:
                        logger.error(f"Database error while saving data for batch {batch_name}, session {session_name}: {str(e)}")
                        return JsonResponse({"error": f"Database Error: {str(e)}"}, status=500)
                    except Exception as e:
                        logger.error(f"Error executing query for batch {batch_name}, session {session_name}: {str(e)}")
                        return JsonResponse({"error": f"Error executing query: {str(e)}"}, status=500)

            return JsonResponse(
                {
                    "success": True,
                    "message": "Batch-wise attendance saved successfully!",
                }
            )

        except Exception as e:
            # Log unexpected errors
            logger.exception(f"Unexpected error occurred while saving batch attendance: {str(e)}")
            return JsonResponse({"error": f"Failed to save batch-wise attendance: {str(e)}"}, status=500)



# Route 3: Fetch average attendance and training performance by Branch_Div (using raw SQL with dynamic table names)
from django.http import JsonResponse
from django.db import connection


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_avg_data(request, table_name):
    try:
        # Validate table_name to prevent SQL injection
        valid_tables = [
            "program1",
            "another_program_table",
        ]  # Add valid table names here
        if table_name not in valid_tables:
            return JsonResponse({"error": "Invalid table name"}, status=400)

        # Construct query to fetch average attendance and performance by Branch_Div with dynamic table name
        query = f"""
            SELECT Branch_Div,
           Year,
           AVG(training_attendance) AS avg_attendance,
           AVG(training_performance) AS avg_performance
    FROM {table_name}
    GROUP BY Branch_Div, Year
        """

        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            # Convert the rows into a list of dictionaries
            columns = [col[0] for col in cursor.description]
            result = [dict(zip(columns, row)) for row in rows]

        return JsonResponse(result, safe=False)

    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": f"Failed to fetch average data: {str(e)}"}, status=500
        )


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def update_attendance(request, table_name):
    if request.method == "POST":
        try:
            # Parse JSON data from request
            data = request.data
            uid = data.get("uid")
            session = data.get("session")
            new_status = data.get("new_status")

            if not uid or not session or new_status not in ["Present", "Absent"]:
                return JsonResponse({"error": "Invalid data provided"}, status=400)

            # Raw SQL query to update attendance
            query = f"""
                UPDATE {table_name}
                SET present = %s
                WHERE uid = %s AND session = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(query, [new_status, uid, session])

            return JsonResponse(
                {"message": "Attendance updated successfully"}, status=200
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to update attendance: {str(e)}"}, status=500
            )
    else:
        return JsonResponse({"error": "Invalid HTTP method"}, status=405)


# Route 5: Create attendance record (using Django ORM and DRF APIView)


class CreateAttendanceRecord(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        faculty = FacultyResponsibility.objects.get(user=request.user)
        if not faculty.program:
            return Response(
                {"error": "Faculty is not assigned to any program"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate required fields
        print(data)
        required_fields = [
            "phase",
            "semester",
            "year",
            "num_sessions",
            "num_days",
            "dates",
            "file_headers",
            "attendance_data",
        ]
        if not all(field in data for field in required_fields):
            return Response(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if 'dates', 'file_headers', and 'attendance_data' are lists
        if (
            not isinstance(data["dates"], list)
            or not isinstance(data["file_headers"], list)
            or not isinstance(data["attendance_data"], list)
        ):
            return Response(
                {"error": "Dates, file_headers, and attendance_data must be lists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Clean the 'attendance_data' to remove unnecessary fields
        cleaned_attendance_data = []
        for record in data["attendance_data"]:
            if "student_data" in record:
                student_data = record["student_data"]
                if isinstance(student_data, list) and len(student_data) == 3:
                    cleaned_attendance_data.append({"student_data": student_data})
                else:
                    return Response(
                        {
                            "error": 'Each "student_data" entry must be a list with 3 elements (UID, Name, Batch)'
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Prepare the SQL insert statement for attendance record
        program_name = data["program_name"]
        year = data["year"]
        num_sessions = data["num_sessions"]
        semester = data["semester"]
        phase = data["phase"]
        num_days = data["num_days"]
        dates = json.dumps(data["dates"])  # Convert list to JSON string
        file_headers = json.dumps(data["file_headers"])  # Convert list to JSON string
        student_data = json.dumps(
            cleaned_attendance_data
        )  # Convert list of student data to JSON string

        # Create raw SQL insert query
        query = """
            INSERT INTO attendance_attendancerecord (
                program_name, year, num_sessions, num_days, dates, file_headers, student_data, semester, phase
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        # Execute the query using Django's connection cursor
        with connection.cursor() as cursor:
            cursor.execute(
                query,
                [
                    program_name,
                    year,
                    num_sessions,
                    num_days,
                    dates,
                    file_headers,
                    student_data,
                    semester,
                    phase,  # Include phase in the query
                ],
            )

        # Get the ID of the newly inserted record
        record_id = cursor.lastrowid

        # Return success response with created record ID
        return Response(
            {
                "message": "Attendance record successfully created!",
                "record_id": record_id,
            },
            status=status.HTTP_201_CREATED,
        )



# route 6
from django.http import JsonResponse
from django.db import connection
import json
from django.views.decorators.csrf import csrf_exempt


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def upload_data(request):
    if request.method == "POST":
        try:
            # Get the parsed data from request
            data = request.data
            students = data.get("students", [])
            faculty = FacultyResponsibility.objects.get(user=request.user)
            if not faculty.program:
                return Response(
                    {"error": "Faculty is not assigned to any program"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # If no student data is provided
            if not students:
                return JsonResponse(
                    {"message": "No student data found in the file."}, status=400
                )

            # Insert data into the 'program1' table
            with connection.cursor() as cursor:
                for student in students:
                    UID = student.get("UID")
                    student_db = Student.objects.filter(uid=UID)
                    if len(student_db):
                        studentDB = student_db[0]
                        TrainingAttendanceSemester.objects.update_or_create(
                            student=studentDB,
                            semester=student.get("semester"),
                            program=faculty.program,
                            defaults={
                                "training_attendance": student.get(
                                    "training_attendance"
                                )
                            },
                        )
                        TrainingPerformanceSemester.objects.update_or_create(
                            student=studentDB,
                            semester=student.get("semester"),
                            program=faculty.program,
                            defaults={
                                "training_performance": student.get(
                                    "training_performance"
                                ),
                            },
                        )
                    student_name = student.get("Name")
                    branch_div = student.get("Branch_Div")
                    semester = student.get("semester")
                    training_attendance = student.get("training_attendance")
                    training_performance = student.get("training_performance")
                    year = student.get("year")
                    # print(student_name)

                    # Insert the student data into the table, wrap column names with backticks
                    cursor.execute(
                        """
                        INSERT INTO program1 (`UID`, `Name`, `branch_div`, `semester`, `training_attendance`, `training_performance`, `year`, `program_name`)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                        [
                            UID,
                            student_name,
                            branch_div,
                            semester,
                            training_attendance,
                            training_performance,
                            year,
                            faculty.program,
                        ],
                    )

            # Return a success response
            return JsonResponse({"message": "Data uploaded successfully!"})

        except Exception as e:
            print(e)
            return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

    return JsonResponse({"message": "Invalid request method."}, status=400)