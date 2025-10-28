from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .serializers import NotificationSerializer
from .models import Notification
from student.models import Student
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db import models
from base import models as base_models

class NotificationListCreate(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)
        try: 
            # Extract data from request
            title = request.data.get("title") 
            message = request.data.get("message")
            expires_at_raw = request.data.get("expires_at")
            expires_at = parse_datetime(expires_at_raw) if expires_at_raw else None
            academic_years = request.data.get("academic_year", "").split(",")
            departments = request.data.get("department", "").split(",")

            # Clean the lists
            academic_years = [year.strip() for year in academic_years if year.strip()]
            departments = [dept.strip() for dept in departments if dept.strip()]

            print("Processed academic years:", academic_years)
            print("Processed departments:", departments)
            notification = Notification.objects.create(
                title=title,
                message=message,
                creator=request.user,
                files=request.FILES.get("files", None),
                type_notification=request.data.get("type_notification", "message"),
            )

            student_query = Student.objects.all()

            if academic_years:
                student_query = student_query.filter(academic_year__in=academic_years)

            if departments:
                student_query = student_query.filter(department__in=departments)

            recipients = [student.user for student in student_query]
            print(f"Found {len(recipients)} recipients")

            if recipients:
                notification.recipients.set(recipients)

            # Return serialized data
            serializer = self.get_serializer(notification)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error creating notification:", str(e))  # Debug print
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(recipients=user).order_by("-created_at")


class NotificationDetail(generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipients=self.request.user)