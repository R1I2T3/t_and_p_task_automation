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
from base.models import User, FacultyResponsibility
from student.models import Student, AcademicAttendanceSemester
from django.db.models import Avg


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
@permission_classes([IsAuthenticated])
def get_program_data(request):
    # Restrict data to the faculty coordinator's department
    faculty = FacultyResponsibility.objects.get(user=request.user)
    if not faculty.department:
        return JsonResponse({"error": "Faculty is not assigned to any department"}, status=403)

    students = Student.objects.filter(department=faculty.department)
    data = {
        "total_students": students.count(),
        "academic_years": list(students.values("academic_year").distinct()),
    }
    return JsonResponse(data, safe=False, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_attendance(request):
    # Restrict attendance saving to the faculty coordinator's department
    faculty = FacultyResponsibility.objects.get(user=request.user)
    if not faculty.department:
        return JsonResponse({"error": "Faculty is not assigned to any department"}, status=403)

    attendance_data = request.data.get("attendance", [])
    for record in attendance_data:
        student = Student.objects.filter(uid=record["uid"], department=faculty.department).first()
        if student:
            AcademicAttendanceSemester.objects.update_or_create(
                student=student,
                semester=record["semester"],
                defaults={"attendance": record["attendance"]},
            )
    return JsonResponse({"message": "Attendance saved successfully"}, status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_attendance(request):
    # Restrict attendance data to the faculty coordinator's department
    faculty = FacultyResponsibility.objects.get(user=request.user)
    if not faculty.department:
        return JsonResponse({"error": "Faculty is not assigned to any department"}, status=403)

    attendance = AcademicAttendanceSemester.objects.filter(student__department=faculty.department)
    data = list(attendance.values("student__uid", "semester", "attendance"))
    return JsonResponse(data, safe=False, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_attendance(request):
    # Restrict attendance reset to the faculty coordinator's department
    faculty = FacultyResponsibility.objects.get(user=request.user)
    if not faculty.department:
        return JsonResponse({"error": "Faculty is not assigned to any department"}, status=403)

    AcademicAttendanceSemester.objects.filter(student__department=faculty.department).delete()
    return JsonResponse({"message": "Attendance reset successfully"}, status=200)
