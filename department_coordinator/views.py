from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from base.models import FacultyResponsibility
from rest_framework.permissions import BasePermission
from student.models import (
    Student,
    AcademicAttendanceSemester,
    AcademicPerformanceSemester,
    StudentOffer,
)
from program_coordinator_api.models import TrainingPerformanceCategory
from .utils import validate_file, importExcelAndReturnJSON
from django.db import models,transaction
from django.db.models import Avg, Count, Q, Max
from .serializers import DepartmentStudentSerializer
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from internship_api.models import InternshipAcceptance
import pandas as pd
import statistics
class IsDepartmentCoordinator(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "faculty"

class DepartmentStudentDataView(APIView):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get(self, request):
        try:
            student_uid = request.GET.get("uid")
            if not student_uid:
                return Response({'error': 'Student UID is required'}, status=status.HTTP_400_BAD_REQUEST)

            student = Student.objects.select_related(
                'user'
            ).prefetch_related(
                'academic_performance',
                'academic_attendance',
                'resume__activities_and_achievements',
                'student_offers__company',
                'student_offers__job_offer',
                'applied_companies__company',
                'applied_companies__job_offer',
                'applied_companies__application',
                'training_performance',
                'internship_offer_acceptance',
            ).get(uid=student_uid)

            response_serializer = DepartmentStudentSerializer(student)
            return Response({"student": response_serializer.data})

        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # It's good practice to log the error
            # logger.error(f"Error fetching student data: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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

class DepartmentDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsDepartmentCoordinator]

    def get(self, request):
        try:
            faculty_info = FacultyResponsibility.objects.get(user=request.user)
            department = faculty_info.department
            students_qs = Student.objects.filter(department=department)
            batches = students_qs.values_list('batch', flat=True).distinct().order_by('-batch')

            summary_by_batch = {}
            all_batches_consent = []
            for batch in batches:
                batch_students = students_qs.filter(batch=batch)
                total_students = batch_students.count()

                if total_students == 0:
                    continue
                academic_and_consent_data = batch_students.aggregate(
                    total_students=Count('id'),
                    average_cgpa=Avg('cgpa'),
                    students_with_kt=Count('id', filter=Q(is_kt=True)),

                    consent_placement=Count('id', filter=Q(consent__startswith='placement')),
                    consent_higher_studies=Count('id', filter=Q(consent='Higher studies')),
                    consent_entrepreneurship=Count('id', filter=Q(consent='Entrepreneurship'))
                )
                placed_offers = StudentOffer.objects.filter(
                    student__in=batch_students,
                    status__in=['accepted', 'joined']
                )

                placed_student_ids = placed_offers.values_list('student_id', flat=True).distinct()
                actual_placed_count = len(placed_student_ids)
                salary_data = placed_offers.aggregate(
                    average_salary=Avg('salary'),
                    highest_salary=Max('salary')
                )
                salaries = list(placed_offers.values_list('salary', flat=True))
                median_salary = 0
                if salaries:
                    median_salary = statistics.median(salaries)
                internship_data = InternshipAcceptance.objects.filter(
                    student__in=batch_students
                ).aggregate(
                    total_internships=Count('id'),
                    in_house_internships=Count('id', filter=Q(offer_type='in_house')),
                    outhouse_internships=Count('id', filter=~Q(offer_type='in_house'))
                )
                training_data = TrainingPerformanceCategory.objects.filter(
                    performance__student__in=batch_students
                ).values(
                    'category_name'
                ).annotate(
                    average_marks=Avg('marks')
                ).order_by('category_name')

                training_stats = {
                    item['category_name']: round(item['average_marks'], 2)
                    for item in training_data if item['average_marks'] is not None
                }
                summary_by_batch[batch] = {
                    "total_students": total_students,
                    "average_cgpa": round(academic_and_consent_data['average_cgpa'] or 0, 2),
                    "students_with_kt": academic_and_consent_data['students_with_kt'],
                    "consent_breakdown": {
                        "placement": academic_and_consent_data['consent_placement'],
                        "higher_studies": academic_and_consent_data['consent_higher_studies'],
                        "entrepreneurship": academic_and_consent_data['consent_entrepreneurship'],
                    },
                    "placement_stats": {
                        "actual_placed_count": actual_placed_count,
                        "average_salary_lpa": round((salary_data['average_salary'] or 0) / 100000, 2),
                        "median_salary_lpa": round(median_salary / 100000, 2), # <-- Use Python variable
                        "highest_salary_lpa": round((salary_data['highest_salary'] or 0) / 100000, 2),
                    },
                    "internship_stats": {
                        "total_internships": internship_data['total_internships'],
                        "in_house": internship_data['in_house_internships'],
                        "outhouse": internship_data['outhouse_internships'],
                    },
                    "training_stats": training_stats
                }
            overall_consent = students_qs.values('consent').annotate(count=Count('id')).order_by()
            consent_chart_data = [{"name": item['consent'], "value": item['count']} for item in overall_consent]
            top_companies = StudentOffer.objects.filter(
                student__department=department,
                status__in=['accepted', 'joined']
            ).values('company__name').annotate(hires_count=Count('id')).order_by('-hires_count')[:10]

            company_chart_data = [{"company_name": item['company__name'], "hires": item['hires_count']} for item in top_companies]
            overall_training_stats = TrainingPerformanceCategory.objects.filter(
                performance__student__department=department
            ).values('category_name').annotate(
                average_marks=Avg('marks')
            ).order_by('category_name')

            overall_training_summary = {
                item['category_name']: round(item['average_marks'], 2)
                for item in overall_training_stats if item['average_marks'] is not None
            }
            response_data = {
                "department_name": department,
                "summary_by_batch": summary_by_batch,
                "overall_consent_summary": consent_chart_data,
                "overall_top_companies": company_chart_data,
                "overall_training_summary": overall_training_summary
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except FacultyResponsibility.DoesNotExist:
            return Response(
                {'error': 'No faculty responsibility found for this user.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)