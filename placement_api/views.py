from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import JSONParser
from rest_framework import status
from .models import CompanyRegistration, Offers, placementNotice
from .serializers import (
    CompanyRegistrationSerializer,
    OffersSerializer,
    PlacementNoticeSerializer,
    JobAcceptanceSerializer,
    JobApplicationSerializer,
)
from rest_framework.permissions import IsAuthenticated
from base.models import User
from django.views.decorators.csrf import csrf_exempt
from student.models import Student
from .models import jobApplication
from uuid import uuid4
from student.serializers import StudentSerializer
from rest_framework.exceptions import NotFound


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def create_company_with_offers(request):
    try:
        data = JSONParser().parse(request)

        # Create CompanyRegistration
        company_data = data.get("company")
        company_serializer = CompanyRegistrationSerializer(data=company_data)
        if company_serializer.is_valid():
            company = company_serializer.save()
        else:
            return JsonResponse(
                company_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        # Create Offers
        offers_data = data.get("offers", [])
        for offer_data in offers_data:
            offer_data["company"] = company
            try:
                Offers.objects.create(**offer_data)
            except:
                pass

        return JsonResponse(
            {"message": "Company and related offers created successfully!"},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_company_with_offers(request, pk=None):
    try:
        if pk:
            # Retrieve a specific company and its offers
            company = CompanyRegistration.objects.get(id=pk)
            company_serializer = CompanyRegistrationSerializer(company)
            offers = Offers.objects.filter(company=company)
            offers_serializer = OffersSerializer(offers, many=True)

            return JsonResponse(
                {
                    "company": company_serializer.data,
                    "offers": offers_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            # Retrieve all companies with their offers
            companies = CompanyRegistration.objects.all()
            response_data = []
            for company in companies:
                company_serializer = CompanyRegistrationSerializer(company)
                offers = Offers.objects.filter(company=company)
                offers_serializer = OffersSerializer(offers, many=True)

                response_data.append(
                    {
                        "company": company_serializer.data,
                        "offers": offers_serializer.data,
                    }
                )

            return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)
    except CompanyRegistration.DoesNotExist:
        return JsonResponse(
            {"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_all_companies(request):
    try:
        companies = CompanyRegistration.objects.all()
        company_data = []
        for company in companies:
            company_serializer = CompanyRegistrationSerializer(company)
            offers = Offers.objects.filter(company=company)
            offers_serializer = OffersSerializer(offers, many=True)
            company_data.append(
                {"company": company_serializer.data, "offers": offers_serializer.data}
            )
        return JsonResponse(company_data, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def create_notice(request, pk):
    try:
        company = CompanyRegistration.objects.get(id=pk)
        data = JSONParser().parse(request)
        notice = data.get("notice")
        notice["company"] = company
        placementNotice.objects.create(**notice)
        return JsonResponse(
            {"message": "Notice created successfully"}, status=status.HTTP_201_CREATED
        )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_notice(request, pk):
    try:
        notice = placementNotice.objects.get(id=pk)
        notice = PlacementNoticeSerializer(notice)
        return JsonResponse({"notice": notice.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
@csrf_exempt
def job_application(request, pk):
    try:
        user = User.objects.get(email=request.user.email)
        student = Student.objects.get(user=user)
        company = CompanyRegistration.objects.get(pk=pk)
        jobApplication.objects.create(student=student, company=company, id=uuid4())
        return JsonResponse(
            {"success": "Job application submitted successfully"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_student_application(request, uid):
    try:
        student = Student.objects.get(uid=uid)
    except Student.DoesNotExist:
        raise NotFound("Student not found.")

    serializer = StudentSerializer(student)
    return JsonResponse({"student": serializer.data}, safe=False)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_applied_students(request, pk):
    try:
        company = jobApplication(pk=pk)
        students = JobApplicationSerializer(company)
        print(students.data)
        return JsonResponse({"students": students.data})
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
