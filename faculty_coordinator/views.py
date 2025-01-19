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
from base.models import User


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


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_program_data(request):
    user = User.objects.get(email=request.user)
    if user.role != "faculty":
        return JsonResponse({"error": "Permission denied"}, status=403)
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
    user = User.objects.get(email=request.user)

    # Check if the user is a faculty member
    if user.role != "faculty":
        return JsonResponse({"error": "Permission denied"}, status=403)

    try:
        # Get the attendance records from the request data
        attendance_records = request.data.get("students", [])

        # Check if there are attendance records provided
        if not attendance_records:
            return JsonResponse({"error": "No attendance data provided"}, status=400)

        # Iterate over each attendance record
        for record in attendance_records:
            # Prepare the SQL query for inserting/updating attendance data
            query = """
                INSERT INTO attendance_data (
                    program_name, session, uid, name, year, batch, present, late, timestamp, semester, phase
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    present = VALUES(present),
                    late = VALUES(late),
                    timestamp = VALUES(timestamp),
                    phase = VALUES(phase);  -- Ensure the phase is updated as well
            """

            # Get the necessary parameters for the query, including the phase
            params = (
                record.get("ProgramName"),  # program_name
                record.get("Session"),  # session
                record.get("UID"),  # uid
                record.get("Name"),  # name
                record.get("Year"),  # year
                record.get("Batch"),  # batch
                record.get("Present", "Absent"),  # present (default to "Absent")
                record.get("Late", "Not Late"),  # late (default to "Not Late")
                datetime.now(),  # timestamp
                record.get("semester"),  # semester
                record.get("Phase"),  # phase (newly added field)
            )

            # Execute the query to insert/update the attendance data
            execute_query(query, params, fetch_all=False)

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
