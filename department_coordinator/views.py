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


INTERNSHIP_JSON_PATH = os.path.join("static", "Data", "intern_data_24.json")
JSON_FILE_PATH_ALUMNI = os.path.join("static", "Data", "alumni_data_2024.json")
JSON_FILE_PATH_PLACEMENT = os.path.join("static", "Data", "placement_data.json")


class DepartmentCoordinatorViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get_department_coordinator(self):
        # Fetch the department coordinator's responsibility
        return FacultyResponsibility.objects.get(user=self.request.user)

    def list(self, request):
        department_coordinator = self.get_department_coordinator()
        if not department_coordinator or not department_coordinator.department:
            return Response(
                {"error": "Department Coordinator not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Filter students by the coordinator's department
        students = Student.objects.filter(department=department_coordinator.department)

        if request.query_params.get("year"):
            students = students.filter(academic_year=request.query_params.get("year"))

        stats = {
            "total_students": students.count(),
            "fe_count": students.filter(academic_year="FE").count(),
            "se_count": students.filter(academic_year="SE").count(),
            "te_count": students.filter(academic_year="TE").count(),
            "be_count": students.filter(academic_year="BE").count(),
        }

        serializer = DepartmentStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        department_coordinator = self.get_department_coordinator()
        if not department_coordinator or not department_coordinator.department:
            return Response(
                {"error": "Department Coordinator not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Filter data by the coordinator's department
        academic_attendance = AcademicAttendanceSemester.objects.filter(
            student__department=department_coordinator.department
        ).values("student__academic_year").annotate(
            avg_attendance=Avg(Cast("attendance", FloatField()))
        )

        academic_performance = AcademicPerformanceSemester.objects.filter(
            student__department=department_coordinator.department
        ).values("student__academic_year").annotate(
            avg_performance=Avg(Cast("performance", FloatField()))
        )

        training_attendance = TrainingAttendanceSemester.objects.filter(
            student__department=department_coordinator.department
        ).values("student__academic_year").annotate(
            avg_attendance=Avg(Cast("training_attendance", FloatField()))
        )

        training_performance = TrainingPerformanceSemester.objects.filter(
            student__department=department_coordinator.department
        ).values("student__academic_year").annotate(
            avg_performance=Avg(Cast("training_performance", FloatField()))
        )

        stats_data = {
            "academic_attendance": {
                entry["student__academic_year"]: round(entry["avg_attendance"], 2)
                for entry in academic_attendance
            },
            "academic_performance": {
                entry["student__academic_year"]: round(entry["avg_performance"], 2)
                for entry in academic_performance
            },
            "training_attendance": {
                entry["student__academic_year"]: round(entry["avg_attendance"], 2)
                for entry in training_attendance
            },
            "training_performance": {
                entry["student__academic_year"]: round(entry["avg_performance"], 2)
                for entry in training_performance
            },
        }

        return Response(stats_data)


class AttendanceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get_department_coordinator(self):
        return FacultyResponsibility.objects.get(user=self.request.user)

    @action(detail=False, methods=["post"])
    def upload_attendance(self, request):
        department_coordinator = self.get_department_coordinator()
        if not department_coordinator or not department_coordinator.department:
            return Response(
                {"error": "Department Coordinator not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
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
                ).aggregate(avg_attendance=models.Avg("attendance"))["avg_attendance"]
                student.attendance = average_attendance
                student.save()
            return Response({"message": "Data imported successfully"})
        except Exception as e:
            print(e)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def upload_performance(self, request):
        department_coordinator = self.get_department_coordinator()
        if not department_coordinator or not department_coordinator.department:
            return Response(
                {"error": "Department Coordinator not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not validate_file(request.FILES.get("file_performance")):
            return Response(
                {"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = importExcelAndReturnJSON(request.FILES.get("file_performance"))
            for record in df:
                student = Student.objects.get(uid=record["uid"].strip())
                AcademicPerformanceSemester.objects.update_or_create(
                    semester=record["semester"],
                    student=student,
                    defaults={"performance": record["performance"]},
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
