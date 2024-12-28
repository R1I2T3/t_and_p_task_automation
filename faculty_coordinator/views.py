# attendance/views.py
from django.http import JsonResponse
from django.db import connection
from datetime import datetime
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


def execute_query(query, params=None, fetch_all=True):
    """Helper function to execute raw SQL queries."""
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        if fetch_all:
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
        else:
            return cursor.rowcount


def get_program_data(request):
    """Fetch program and student data."""
    try:
        query = "SELECT * FROM attendance_attendancerecord"
        data = execute_query(query)
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def save_attendance(request):
    """Save attendance data."""
    if request.user.role != "faculty":
        return JsonResponse({"error": "Permission denied"}, status=403)
    try:
        attendance_records = request.data.get("students")
        if not attendance_records:
            return JsonResponse({"error": "No attendance data provided"}, status=400)
        print(attendance_records)
        for record in attendance_records:
            # First check if record exists
            check_query = """
                SELECT id FROM attendance_data 
                WHERE uid = %s AND program_name = %s AND session = %s AND semester = %s
            """
            check_params = (
                record.get("UID"),
                record.get("ProgramName"),
                record.get("Session"),
                record.get("semester"),
            )
            existing_record = execute_query(check_query, check_params)

            if existing_record:
                # Update existing record
                update_query = """
                    UPDATE attendance_data 
                    SET present = %s, late = %s, absent = %s, timestamp = %s
                    WHERE uid = %s AND program_name = %s AND session = %s AND semester = %s
                """
                update_params = (
                    record.get("status") == "present",
                    record.get("status") == "late",
                    record.get("status") == "absent",
                    datetime.now(),
                    record.get("UID"),
                    record.get("ProgramName"),
                    record.get("Session"),
                    record.get("semester"),
                )
                execute_query(update_query, update_params, fetch_all=False)
            else:
                # Insert new record
                insert_query = """
                    INSERT INTO attendance_data (
                        program_name, session, uid, name, year, batch, present, late, absent, timestamp, semester
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                insert_params = (
                    record.get("ProgramName"),
                    record.get("Session"),
                    record.get("UID"),
                    record.get("Name"),
                    record.get("Year"),
                    record.get("Batch"),
                    record.get("status") == "present",
                    record.get("status") == "late",
                    record.get("status") == "absent",
                    datetime.now(),
                    record.get("semester"),
                )
                execute_query(insert_query, insert_params, fetch_all=False)

        return JsonResponse(
            {"message": "Attendance data saved successfully"}, status=200
        )
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_attendance(request):
    """Fetch saved attendance records."""
    if request.user.role != "faculty":
        return JsonResponse({"error": "Permission denied"}, status=403)
    try:
        query = "SELECT * FROM attendance_attendancerecord"
        data = execute_query(query)
        return JsonResponse(data, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def reset_attendance(request):
    """Reset the attendance table."""
    try:
        query = "TRUNCATE TABLE attendance_attendancerecord"
        execute_query(query, fetch_all=False)
        return JsonResponse(
            {"message": "Attendance table reset successfully"}, status=200
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
