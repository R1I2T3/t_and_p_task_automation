from rest_framework import generics,status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CompanyRegistration
from .serializers import FormDataSerializer
from .utils import get_eligible_students
from notifications.serializers import NotificationSerializer
from django.shortcuts import get_object_or_404
from student.models import Student
from notifications.models import Notification
from dotenv import load_dotenv
import os
class CompanyListCreateView(generics.CreateAPIView):
    queryset = CompanyRegistration.objects.all()
    serializer_class = FormDataSerializer


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FormDataSerializer
    lookup_field = "id"

    def get_object(self):
        company_id = self.kwargs.get("id")
        return CompanyRegistration.objects.get(id=company_id)



class CompanyByBatchView(generics.ListAPIView):
    serializer_class = FormDataSerializer

    def get_queryset(self):
        batch = self.kwargs.get("batch")
        return CompanyRegistration.objects.filter(batch=batch)


class CompanyBatchesView(APIView):
    def get(self, request, *args, **kwargs):
        batches = CompanyRegistration.objects.values_list('batch', flat=True).distinct()
        return Response(batches)



class SendPlacementNotificationApiView(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    lookup_field = "id"

    def create(self, request, *args, **kwargs):
        try:
            load_dotenv()
            company_id = self.kwargs.get("id")
            company = get_object_or_404(CompanyRegistration, id=company_id)
            eligible_student_ids = get_eligible_students(company)
            if not eligible_student_ids:
                return Response(
                    {"message": "No eligible students found for this company."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            students = Student.objects.filter(id__in=eligible_student_ids)
            recipients = [student.user for student in students]

            title = f"Placement Opportunity: {company.name}"
            message = (
                f"Dear Student,\n\nYou are eligible to apply for placement at {company.name}.\n"
                f"Apply link: {os.getenv('CLIENT_URL')}/student/placement/registration/{company.id}\n\nBest regards,\nTraining and Placement Team"
            )
            notification = Notification.objects.create(
                title=title,
                message=message,
                creator=request.user,
                type_notification="placement",
            )

            notification.recipients.set(recipients)
            serializer = self.get_serializer(notification)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print("Error sending placement notification:", str(e))
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
