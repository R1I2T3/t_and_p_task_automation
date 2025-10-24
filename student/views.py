import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import (
    User,
    Student,
    AcademicAttendanceSemester,
    TrainingAttendanceSemester,
    Resume,
    StudentPlacementAppliedCompany,
    PlacementCompanyProgress
)
from .serializers import (
    ResumeSerializer,
    SessionAttendanceSerializer,
    StudentConsentUpdateSerializer,
    StudentPliUpdateSerializer,
)

from program_coordinator_api.models import (
    AttendanceData,
)
from .utils import categorize,is_student_eligible
from staff.models import CompanyRegistration,JobOffer

from datetime import datetime
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.timezone import now

class StudentDataView(APIView):
    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            response_serializer = StudentSerializer(student)
            student_data = response_serializer.data
            return Response({"student": student_data})
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class StudentFormView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        try:
            student = Student.objects.get(user=request.user)
            notification_obj = Notification.objects.get(id=id)

            if not notification_obj.link:
                return Response(
                    {'error': 'Page Not Found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            if notification_obj.expires_at and now() > notification_obj.expires_at:
                return Response(
                    {"error": "This form has expired. Please contact the TNP."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if "consent" in request.path:
                serializer = StudentConsentUpdateSerializer(student, data=request.data, partial=True)
            elif "pli" in request.path:
                serializer = StudentPliUpdateSerializer(student, data=request.data, partial=True)
            else:
                return Response({'error': 'Invalid form type'}, status=status.HTTP_400_BAD_REQUEST)

            if serializer.is_valid():
                serializer.save()

                if "pli" in request.path:
                    response_serializer = StudentSerializer(student)
                    student_data = response_serializer.data
                    return Response({"student": student_data})
                
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

        except Notification.DoesNotExist:
            return Response({'error': 'Page not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SessionAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)  # Get student object
            attendance_data = AttendanceData.objects.filter(
                uid=student.uid
            )  # Fetch attendance data

            serializer = SessionAttendanceSerializer(
                attendance_data, many=True
            )  # Serialize data
            return Response(serializer.data)  # Return JSON response
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)


class HomeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            raise PermissionDenied(
                "You do not have permission to access this resource."
            )

        student = Student.objects.get(user=request.user)
        academic_attendance = AcademicAttendanceSemester.objects.filter(student=student)
        academic_performance = student.academic_performance.all()  # type: ignore
        training_attendance = TrainingAttendanceSemester.objects.filter(student=student)
        training_performance = student.training_performance.all()  # type: ignore

        academic_attendance_dict = {
            item.semester: item.attendance for item in academic_attendance
        }
        academic_performance_dict = {
            item.semester: item.performance for item in academic_performance
        }
        training_attendance_dict = {
            item.semester: item.training_attendance for item in training_attendance
        }
        training_performance_dict = {
            item.semester: item.training_performance for item in training_performance
        }

        return JsonResponse(
            {
                "academic_attendance": academic_attendance_dict,
                "academic_performance": academic_performance_dict,
                "training_attendance": training_attendance_dict,
                "training_performance": training_performance_dict,
            }
        )


class SdPAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "student":
            raise PermissionDenied(
                "You do not have permission to access this resource."
            )

        student = Student.objects.get(user=request.user)

        academic_attendance_sum = student.academic_attendance.aggregate(
            Sum("attendance")
        ).get("attendance__sum")  # type: ignore
        academic_attendance = (
            academic_attendance_sum / student.academic_attendance.count()
            if academic_attendance_sum is not None
            else None
        )

        academic_performance_sum = student.academic_performance.aggregate(
            Sum("performance")
        ).get("performance__sum")  # type: ignore
        academic_performance = (
            academic_performance_sum / student.academic_performance.count()
            if academic_performance_sum is not None
            else None
        )

        training_attendance_sum = student.training_attendance.aggregate(
            Sum("training_attendance")
        ).get("training_attendance__sum")  # type: ignore
        training_attendance = (
            training_attendance_sum / student.training_attendance.count()
            if training_attendance_sum is not None
            else None
        )

        training_performance_sum = student.training_performance.aggregate(
            Sum("training_performance")
        ).get("training_performance__sum")  # type: ignore
        training_performance = (
            training_performance_sum / student.training_performance.count()
            if training_performance_sum is not None
            else None
        )

        category = categorize(
            academic_attendance,
            academic_performance,
            training_attendance,
            training_performance,
            student.batch,
        )

        return JsonResponse(
            {
                "uid": student.uid,
                "department": student.department,
                "academic_year": student.academic_year,
                "full_name": student.user.full_name,
                "category": category,
                "batch": student.batch,
            }
        )


class ResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            resume = Resume.objects.get(student=student)
            serializer = ResumeSerializer(resume)
            return Response(serializer.data)
        except Resume.DoesNotExist:
            return Response(
                {"message": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            data_str = request.data.get('data')
            if not data_str:
                return Response({'data': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                data = json.loads(data_str)
            except json.JSONDecodeError:
                return Response({'data': 'Invalid JSON string.'}, status=status.HTTP_400_BAD_REQUEST)
            profile_image = request.data.get('profile_image')
            if profile_image:
                data['profile_image'] = profile_image
            serializer = ResumeSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                serializer.save(student=student)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"[ERROR] ResumeView POST: {e}")
            return Response(
                {"message": "Internal Server Error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request):
        try:
            data_str = request.data.get('data')
            if not data_str:
                return Response({'data': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                data = json.loads(data_str)
            except json.JSONDecodeError:
                return Response({'data': 'Invalid JSON string.'}, status=status.HTTP_400_BAD_REQUEST)
            profile_image = request.data.get('profile_image')
            if profile_image:
                data['profile_image'] = profile_image
            student = Student.objects.get(user=request.user)
            resume = Resume.objects.get(student=student)
            serializer = ResumeSerializer(
            instance=resume,
            data=data,
            context={'request': request},
            partial=True
        )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Resume.DoesNotExist:
            return Response(
                {"message": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )

class PlacementCompanyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            try:
                student = Student.objects.get(user=request.user)
            except Student.DoesNotExist:
                return Response(
                    {"message": "You can't fill this form"},
                    status=status.HTTP_404_NOT_FOUND
                )

            data = request.data
            interest = data.get("interest", "").strip().lower()
            company_id = data.get("company_id")

            if not company_id:
                return Response(
                    {"message": "Company ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            company = get_object_or_404(CompanyRegistration, id=company_id)
            if StudentPlacementAppliedCompany.objects.filter(student=student, company=company).exists():
                return Response(
                    {"message": "You have already responded for this company"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if interest in ["no", "false"]:
                reason = data.get("reason", "").strip()
                if not reason:
                    return Response(
                        {"message": "Please provide a reason"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                StudentPlacementAppliedCompany.objects.create(
                    student=student,
                    company=company,
                    job_offer=None,
                    interested=False,
                    not_interested_reason=reason
                )

                return Response(
                    {"message": "Response recorded"},
                    status=status.HTTP_201_CREATED
                )
            offer_role = data.get("offer_role", "").strip()
            if not offer_role:
                return Response(
                    {"message": "Offer role is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                offer = JobOffer.objects.get(form=company, role=offer_role)
            except JobOffer.DoesNotExist:
                return Response(
                    {"message": "Invalid job offer role"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            is_eligible = is_student_eligible(student, company,offer)
            if not is_eligible:
                return Response(
                    {"message": "You are not eligible for this company"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            applied=StudentPlacementAppliedCompany.objects.create(
                student=student,
                company=company,
                job_offer=offer,
                interested=True,
                not_interested_reason=""
            )
            PlacementCompanyProgress.objects.get_or_create(
                application=applied
            )
            return Response(
                {"message": "You are registered"},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print(f"[ERROR] PlacementCompanyAPIView: {e}")
            return Response(
                {"message": "Internal Server Error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
