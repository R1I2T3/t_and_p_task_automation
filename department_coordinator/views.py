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


class IsDepartmentCoordinator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "faculty"


INTERNSHIP_JSON_PATH = os.path.join("static", "Data", "intern_data_24.json")
JSON_FILE_PATH_ALUMNI = os.path.join("static", "Data", "alumni_data_2024.json")
JSON_FILE_PATH_PLACEMENT = os.path.join("static", "Data", "placement_data.json")


class DepartmentCoordinatorViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get_department_coordinator(self):
        return FacultyResponsibility.objects.get(user=self.request.user)

    def list(self, request):
        department_coordinator = self.get_department_coordinator()
        students = Student.objects.select_related("user").all()
        department_students = students.filter(
            department=department_coordinator.department
        )

        if request.query_params.get("year"):
            department_students = department_students.filter(
                academic_year=request.query_params.get("year")
            )

        stats = {
            "total_students": len(department_students),
            "fe_count": len(department_students.filter(academic_year="FE")),
            "se_count": len(department_students.filter(academic_year="SE")),
            "te_count": len(department_students.filter(academic_year="TE")),
            "be_count": len(department_students.filter(academic_year="BE")),
            "department_students": department_students,
        }

        serializer = DepartmentStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        department_coordinator = self.get_department_coordinator()

        # Calculate averages
        average_academic_attendance = (
            AcademicAttendanceSemester.objects.select_related("student")
            .filter(student__department=department_coordinator.department)
            .values("student__academic_year")
            .annotate(avg_attendance=Avg(Cast("attendance", FloatField())))
            .order_by("student__academic_year")
        )

        average_academic_performance = (
            AcademicPerformanceSemester.objects.select_related("student")
            .filter(student__department=department_coordinator.department)
            .values("student__academic_year")
            .annotate(avg_performance=Avg(Cast("performance", FloatField())))
            .order_by("student__academic_year")
        )

        average_training_attendance = (
            TrainingAttendanceSemester.objects.select_related("student")
            .filter(student__department=department_coordinator.department)
            .values("student__academic_year")
            .annotate(avg_attendance=Avg(Cast("training_attendance", FloatField())))
            .order_by("student__academic_year")
        )

        average_training_performance = (
            TrainingPerformanceSemester.objects.select_related("student")
            .filter(student__department=department_coordinator.department)
            .values("student__academic_year")
            .annotate(avg_performance=Avg(Cast("training_performance", FloatField())))
            .order_by("student__academic_year")
        )

        # Convert to dictionaries
        stats_data = {
            "academic_attendance": {
                entry["student__academic_year"]: round(entry["avg_attendance"], 2)
                for entry in average_academic_attendance
            },
            "academic_performance": {
                entry["student__academic_year"]: round(entry["avg_performance"], 2)
                for entry in average_academic_performance
            },
            "training_attendance": {
                entry["student__academic_year"]: round(entry["avg_attendance"], 2)
                for entry in average_training_attendance
            },
            "training_performance": {
                entry["student__academic_year"]: round(entry["avg_performance"], 2)
                for entry in average_training_performance
            },
        }

        # Add internship and placement data
        try:
            with open(INTERNSHIP_JSON_PATH, "r") as f:
                internship_data = json.load(f)
                branch_data = internship_data[0]["branch_data"]
                stipend_data = internship_data[0]["stipend_per_branch"]

                stats_data["internship"] = {
                    "branches": {
                        k: v
                        for k, v in branch_data.items()
                        if k.lower().startswith(
                            department_coordinator.department.lower()
                        )
                    },
                    "stipends": {
                        k: v
                        for k, v in stipend_data.items()
                        if k.lower().startswith(
                            department_coordinator.department.lower()
                        )
                    },
                }

            with open(JSON_FILE_PATH_PLACEMENT, "r") as f:
                placement_data = json.load(f)
                stats_data["placement"] = {
                    "2023": {
                        k: v
                        for k, v in placement_data[0]["branch_comparison"][
                            "2023"
                        ].items()
                        if k.lower().startswith(
                            department_coordinator.department.lower()
                        )
                    },
                    "2024": {
                        k: v
                        for k, v in placement_data[0]["branch_comparison"][
                            "2024"
                        ].items()
                        if k.lower().startswith(
                            department_coordinator.department.lower()
                        )
                    },
                }
        except Exception as e:
            stats_data["internship"] = {}
            stats_data["placement"] = {}

        return Response(stats_data)


class AttendanceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    @action(detail=False, methods=["post"])
    def upload_attendance(self, request):
        if not validate_file(request.FILES.get("file_attendance")):
            return Response(
                {"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = importExcelAndReturnJSON(request.FILES.get("file_attendance"))
            for record in df:
                student = Student.objects.get(uid=record["uid"])
                AcademicAttendanceSemester.objects.update_or_create(
                    semester=record["semester"],
                    student=student,
                    defaults={"attendance": record["attendance"]},
                )
            return Response({"message": "Data imported successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def upload_performance(self, request):
        if not validate_file(request.FILES.get("file_performance")):
            return Response(
                {"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            df = importExcelAndReturnJSON(request.FILES.get("file_performance"))
            for record in df:
                student = Student.objects.get(uid=record["uid"])
                AcademicPerformanceSemester.objects.update_or_create(
                    semester=record["semester"],
                    student=student,
                    defaults={"performance": record["performance"]},
                )
            return Response({"message": "Data imported successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
