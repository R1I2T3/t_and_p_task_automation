from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum
from django.http import JsonResponse
from .models import (
    Student,
    AcademicAttendanceSemester,
    TrainingAttendanceSemester,
    Resume,
)
from .serializers import (
    ResumeSerializer,
    SessionAttendanceSerializer,
)

from program_coordinator_api.models import (
    AttendanceData,
)  # Import model from another app
from .utils import categorize


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
            resume = Resume.objects.get(student=student)
            serializer = ResumeSerializer(resume, data=request.data)
        except Resume.DoesNotExist:
            serializer = ResumeSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(student=student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            student = Student.objects.get(user=request.user)
            resume = Resume.objects.get(student=student)
            serializer = ResumeSerializer(resume, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Resume.DoesNotExist:
            return Response(
                {"message": "Resume not found"}, status=status.HTTP_404_NOT_FOUND
            )
