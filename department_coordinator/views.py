from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, FloatField
from django.db.models.functions import Cast
from base.models import FacultyResponsibility
from rest_framework.permissions import BasePermission
from student.models import (
    Student,
    AcademicAttendanceSemester,
    AcademicPerformanceSemester,
    TrainingAttendanceSemester,
    TrainingPerformanceSemester,
)
import json
import os
from .utils import validate_file, importExcelAndReturnJSON
from .serializers import DepartmentStatsSerializer
from django.db import models


class IsDepartmentCoordinator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "faculty"

class DepartmentCoordinatorViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_department_coordinator(self):
        user = self.request.user
        if user.role == "faculty":  # Restrict only for faculty users
            return FacultyResponsibility.objects.filter(user=user).first()
        return None  # Allow other roles to access data without restrictions

    def list(self, request):
        department_coordinator = self.get_department_coordinator()
        if department_coordinator and department_coordinator.department:
            students = Student.objects.select_related("user").filter(
                department__startswith=department_coordinator.department
            )

            if request.query_params.get("year"):
                students = students.filter(
                    academic_year=request.query_params.get("year")
                )

            stats = {
                "total_students": len(students),
                "fe_count": len(students.filter(academic_year="FE")),
                "se_count": len(students.filter(academic_year="SE")),
                "te_count": len(students.filter(academic_year="TE")),
                "be_count": len(students.filter(academic_year="BE")),
            }

            serializer = DepartmentStatsSerializer(stats)
            return Response(serializer.data)
        # Allow other roles to access all students
        students = Student.objects.select_related("user").all()
        serializer = DepartmentStatsSerializer({"total_students": len(students)})
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get_department_coordinator(self):
        user = self.request.user
        if user.role == "faculty":  # Restrict only for faculty users
            return FacultyResponsibility.objects.filter(user=user).first()
        return None  # Allow other roles to access data without restrictions

    @action(detail=False, methods=["post"])
    def upload_attendance(self, request):
        department_coordinator = self.get_department_coordinator()
        if department_coordinator and department_coordinator.department:
            if not validate_file(request.FILES.get("file_attendance")):
                return Response(
                    {"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST
                )

            try:
                df = importExcelAndReturnJSON(request.FILES.get("file_attendance"))
                for record in df:
                    student = Student.objects.get(uid=record["uid"].strip())
                    AcademicAttendanceSemester.objects.update_or_create(
                        semester=record["semester"],
                        student=student,
                        defaults={"attendance": record["attendance"]},
                    )
                    average_attendance = AcademicAttendanceSemester.objects.filter(
                        student=student
                    ).aggregate(avg_attendance=models.Avg("attendance"))[
                        "avg_attendance"
                    ]
                    student.attendance = average_attendance
                    student.save()
                return Response({"message": "Data imported successfully"})
            except Exception as e:
                print(e)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # Restrict access for other roles
        return Response(
            {"error": "Access restricted for your role"},
            status=status.HTTP_403_FORBIDDEN,
        )

    @action(detail=False, methods=["post"])
    def upload_performance(self, request):
        department_coordinator = self.get_department_coordinator()
        if department_coordinator and department_coordinator.department:
            if not validate_file(request.FILES.get("file_performance")):
                return Response(
                    {"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST
                )

            try:
                df = importExcelAndReturnJSON(request.FILES.get("file_performance"))
                for record in df:
                    student = Student.objects.get(uid=record["uid"].strip())
                    semester_record, created = (
                        AcademicPerformanceSemester.objects.update_or_create(
                            semester=record["semester"],
                            student=student,
                            defaults={"performance": record["performance"]},
                        )
                    )
                    average_performance = AcademicPerformanceSemester.objects.filter(
                        student=student
                    ).aggregate(avg_performance=models.Avg("performance"))[
                        "avg_performance"
                    ]
                    student.cgpa = average_performance
                    student.save()
                return Response({"message": "Data imported successfully"})
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # Restrict access for other roles
        return Response(
            {"error": "Access restricted for your role"},
            status=status.HTTP_403_FORBIDDEN,
        )
