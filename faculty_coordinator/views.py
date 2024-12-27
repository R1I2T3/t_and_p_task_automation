# attendance/views.py
from django.http import JsonResponse
from django.db import connection
from datetime import datetime
import json
from django.views.decorators.csrf import csrf_exempt


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


@csrf_exempt
def save_attendance(request):
    """Save attendance data."""
    try:
        attendance_records = json.loads(request.body).get("students", [])
        if not attendance_records:
            return JsonResponse({"error": "No attendance data provided"}, status=400)

        for record in attendance_records:
            query = """
                INSERT INTO attendance_data (
                    program_name, session, uid, name, year, batch, present, late, timestamp
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    present = VALUES(present),
                    late = VALUES(late),
                    timestamp = VALUES(timestamp);
            """
            params = (
                record.get("ProgramName"),
                record.get("Session"),
                record.get("UID"),
                record.get("Name"),
                record.get("Year"),
                record.get("Batch"),
                record.get("Present", "Absent"),
                record.get("Late", "Not Late"),
                datetime.now(),
            )
            execute_query(query, params, fetch_all=False)

        return JsonResponse(
            {"message": "Attendance data saved successfully"}, status=200
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_attendance(request):
    """Fetch saved attendance records."""
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


def init_data(request):
    """Initialize sample data for testing."""
    try:
        sample_data = [
            (
                "Program A",
                "2024",
                '["2024-06-01", "2024-06-02"]',
                2,
                '[{"student_data": ["UID001", "Alice Johnson", "Batch 1"]}, {"student_data": ["UID002", "Bob Smith", "Batch 1"]}]',
            ),
            (
                "Program B",
                "2024",
                '["2024-06-05"]',
                3,
                '[{"student_data": ["UID004", "David White", "Batch 2"]}]',
            ),
        ]
        query = """
            INSERT INTO programs (program_name, year, session_dates, num_sessions, student_data)
            VALUES (%s, %s, %s, %s, %s)
        """
        with connection.cursor() as cursor:
            cursor.executemany(query, sample_data)
        return JsonResponse(
            {"message": "Sample data initialized successfully"}, status=200
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
