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

                for session, session_data in batch.items():
                    if session not in [
                        "batch",
                        "program_name",
                        "year",
                        "totalStudents",
                        "totalPresent",
                        "totalAbsent",
                        "totalLate",
                    ]:
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
                        with connection.cursor() as cursor:
                            cursor.execute(
                                query,
                                (
                                    batch_name,
                                    session,
                                    program_name,
                                    year,
                                    total_students,
                                    total_present,
                                    total_absent,
                                    total_late,
                                ),
                            )

            return JsonResponse(
                {
                    "success": True,
                    "message": "Batch-wise attendance saved successfully!",
                }
            )

        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to save batch-wise attendance: {str(e)}"}, status=500
            )


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
        num_days = data["num_days"]
        dates = json.dumps(data["dates"])  # Convert list to JSON string
        file_headers = json.dumps(data["file_headers"])  # Convert list to JSON string
        student_data = json.dumps(
            cleaned_attendance_data
        )  # Convert list of student data to JSON string

        # Create raw SQL insert query
        query = """
            INSERT INTO attendance_attendancerecord (program_name, year, num_sessions, num_days, dates, file_headers, student_data,semester)
            VALUES (%s, %s, %s, %s, %s, %s, %s,%s)
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
                    student_db_array = Student.objects.filter(uid=UID)
                    if len(student_db_array) == 1:
                        student_db = student_db_array[0]
                        TrainingAttendanceSemester.objects.update_or_create(
                            student=student_db,
                            semester=student.get("semester"),
                            program=faculty.program,
                            defaults={
                                "training_attendance": student.get(
                                    "training_attendance"
                                )
                            },
                        )
                        TrainingPerformanceSemester.objects.update_or_create(
                            student=student_db,
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
