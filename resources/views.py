from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer
from student.models import Student

class ResourceListCreate(generics.ListCreateAPIView):
    queryset = Resource.objects.all().order_by("-created_at")
    serializer_class = ResourceSerializer

    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)  # Debugging

        try:
            title = request.data.get("title")
            message = request.data.get("message")
            academic_years = request.data.get("academic_year", "").split(",")
            departments = request.data.get("department", "").split(",")

            # Remove empty values
            academic_years = [year.strip() for year in academic_years if year.strip()]
            departments = [dept.strip() for dept in departments if dept.strip()]

            print("Processed academic years:", academic_years)
            print("Processed departments:", departments)

            # Create the resource entry
            resource = Resource.objects.create(
                title=title,
                message=message,
                creator=request.user,  # Creator is the logged-in user
                academic_year=academic_years,
                department=departments,
                file=request.FILES.get("file", None),
            )

            # Fetch students based on filters
            student_query = Student.objects.all()

            if academic_years:
                student_query = student_query.filter(academic_year__in=academic_years)

            if departments:
                student_query = student_query.filter(department__in=departments)

            # Set recipients (students who match the criteria)
            recipients = [student.user for student in student_query]
            print(f"Found {len(recipients)} recipients")

            if recipients:
                resource.recipients.set(recipients)

            serializer = self.get_serializer(resource)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error creating resource:", str(e))  # Debugging
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResourceDetail(generics.RetrieveAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
