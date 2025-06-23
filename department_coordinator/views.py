from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.decorators import api_view, authentication_classes, permission_classes
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
from .serializers import DepartmentStatsSerializer, DepartmentStudentSerializer
from django.db import models
import pandas as pd
from internship_api.models import InternshipAcceptance
from django.db import transaction
from datetime import datetime
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.views import APIView


class IsDepartmentCoordinator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "faculty"

class DepartmentStudentDataView(APIView):
    def get(self, request):
        try:
            student_uid = request.GET.get("uid")
            if not student_uid:
                return Response({'error': 'Student UID is required'}, status=status.HTTP_400_BAD_REQUEST)

            student = Student.objects.get(uid=student_uid)
            response_serializer = DepartmentStudentSerializer(student)
            return Response({"student": response_serializer.data})
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

INTERNSHIP_JSON_PATH = os.path.join("static", "Data", "intern_data_24.json")
JSON_FILE_PATH_ALUMNI = os.path.join("static", "Data", "alumni_data_2024.json")
JSON_FILE_PATH_PLACEMENT = os.path.join("static", "Data", "placement_data.json")


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

    @action(detail=False, methods=["get"])
    def stats(self, request):
        department_coordinator = self.get_department_coordinator()
        if department_coordinator and department_coordinator.department:
            # Calculate averages
            average_academic_attendance = (
                AcademicAttendanceSemester.objects.select_related("student")
                .filter(student__department__startswith=department_coordinator.department)
                .values("student__academic_year")
                .annotate(avg_attendance=Avg(Cast("attendance", FloatField())))
                .order_by("student__academic_year")
            )
            print(average_academic_attendance)
            average_academic_performance = (
                AcademicPerformanceSemester.objects.select_related("student")
                .filter(student__department__startswith=department_coordinator.department)
                .values("student__academic_year")
                .annotate(avg_performance=Avg(Cast("performance", FloatField())))
                .order_by("student__academic_year")
            )

            average_training_attendance = (
                TrainingAttendanceSemester.objects.select_related("student")
                .filter(student__department__startswith=department_coordinator.department)
                .values("student__academic_year")
                .annotate(avg_attendance=Avg(Cast("training_attendance", FloatField())))
                .order_by("student__academic_year")
            )

            average_training_performance = (
                TrainingPerformanceSemester.objects.select_related("student")
                .filter(student__department__startswith=department_coordinator.department)
                .values("student__academic_year")
                .annotate(avg_performance=Avg(Cast("training_performance", FloatField())))
                .order_by("student__academic_year")
            )
            print(average_academic_attendance)

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
        # Allow other roles to access all stats
        return Response({"error": "Access restricted for your role"}, status=status.HTTP_403_FORBIDDEN)


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
                    ).aggregate(avg_attendance=models.Avg("attendance"))["avg_attendance"]
                    student.attendance = average_attendance
                    student.save()
                return Response({"message": "Data imported successfully"})
            except Exception as e:
                print(e)
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # Restrict access for other roles
        return Response({"error": "Access restricted for your role"}, status=status.HTTP_403_FORBIDDEN)

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
        return Response({"error": "Access restricted for your role"}, status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([])
def upload_inhouse_internship(request):
    department_coordinator = FacultyResponsibility.objects.filter(user=request.user).first()
    if not department_coordinator or not department_coordinator.department:
        return Response(
            {"error": "Access restricted for your role"}, 
            status=status.HTTP_403_FORBIDDEN
        )

    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response({'error': 'Only CSV files are allowed'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Read CSV file
        df = pd.read_csv(file)
        
        # Validate required columns
        required_columns = [
            'uid', 'year', 'type', 'stipend', 'is_verified', 'domain_name', 'total_hours', 'start_date', 'end_date'
        ]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return Response({
                'error': f'Missing required columns: {", ".join(missing_columns)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate data types and formats
        try:
            df['start_date'] = pd.to_datetime(df['start_date'])
            df['end_date'] = pd.to_datetime(df['end_date'])
            df['stipend'] = pd.to_numeric(df['stipend'])
            df['total_hours'] = pd.to_numeric(df['total_hours'])
            df['is_verified'] = df['is_verified'].astype(str).str.lower().map({'true': True, 'false': False})
            if df['is_verified'].isnull().any():
                raise ValueError('is_verified must be true or false')
        except Exception as e:
            return Response({
                'error': f'Invalid data format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Process each row
        success_count = 0
        error_rows = []
        
        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    student = Student.objects.get(uid=row['uid'])
                    if not student.department.startswith(department_coordinator.department):
                        error_rows.append({
                            'row': index + 2,
                            'error': f'Student {row["uid"]} does not belong to your department'
                        })
                        continue
                    InternshipAcceptance.objects.create(
                        student=student,
                        year=row['year'],
                        type=row['type'],
                        salary=float(row['stipend']),
                        is_verified=row['is_verified'],
                        domain_name=row['domain_name'],
                        total_hours=int(row['total_hours']),
                        start_date=row['start_date'],
                        completion_date=row['end_date'],
                        offer_type='in_house',
                        company_name="Inhouse"  # or set as needed
                    )
                    success_count += 1
                except Student.DoesNotExist:
                    error_rows.append({
                        'row': index + 2,
                        'error': f'Student with ID {row["uid"]} not found'
                    })
                except Exception as e:
                    error_rows.append({
                        'row': index + 2,
                        'error': str(e)
                    })

        return Response({
            'message': f'Successfully processed {success_count} records',
            'errors': error_rows if error_rows else None
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Error processing file: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)