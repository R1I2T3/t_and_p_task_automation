from django.http import JsonResponse
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
    parser_classes,
)
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework import status
from .models import (
    InternshipRegistration,
    Offers,
    InternshipNotice,
    InternshipAcceptance,
)
from .serializers import (
    InternshipRegistrationSerializer,
    OffersSerializer,
    InternshipNoticeSerializer,
    InternshipAcceptanceSerializer,
    InternshipApplicationSerializer,
    InternshipDataSerializer,
)
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from .models import InternshipApplication
from uuid import uuid4
from rest_framework.exceptions import NotFound
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from uuid import uuid4
from student.models import Student
from base.models import User
from datetime import datetime


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_company_with_offers(request):
    try:
        data = request.data
        print(data)
        company_data = data.get("company")
        print(company_data)
        company_serializer = InternshipRegistrationSerializer(data=company_data)
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
            except Exception as e:
                print(e)
        return JsonResponse(
            {
                "message": "Company and related offers created successfully!",
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_company_with_offers(request, pk=None):
    try:
        if pk:
            # Retrieve a specific company and its offers
            company = InternshipRegistration.objects.get(id=pk)
            company_serializer = InternshipRegistrationSerializer(company)
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
            companies = InternshipRegistration.objects.all()
            response_data = []
            for company in companies:
                company_serializer = InternshipRegistrationSerializer(company)
                offers = Offers.objects.filter(company=company)
                offers_serializer = OffersSerializer(offers, many=True)

                response_data.append(
                    {
                        "company": company_serializer.data,
                        "offers": offers_serializer.data,
                    }
                )

            return JsonResponse(response_data, safe=False, status=status.HTTP_200_OK)
    except InternshipRegistration.DoesNotExist:
        return JsonResponse(
            {"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_companies(request):
    try:
        companies = InternshipRegistration.objects.all()
        company_data = []
        for company in companies:
            company_serializer = InternshipRegistrationSerializer(company)
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


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_notice(request, pk):
    try:
        company = InternshipRegistration.objects.get(id=pk)
        data = request.data
        print(company)
        if not company:
            return JsonResponse(
                {"error": "Company not found."}, status=status.HTTP_404_NOT_FOUND
            )

        notice_data = data
        notice_data["company"] = company
        notice_data = {
            "srNo": data.get("srNo", ""),
            "date": data.get("date", ""),
            "to": data.get("to", ""),
            "subject": data.get("subject", ""),
            "Intro": data.get("intro", ""),
            "Eligibility_Criteria": data.get("eligibility_criteria", ""),
            "About_Company": data.get("about", ""),
            "Location": data.get("location", ""),
            "Documents_to_Carry": data.get("Documents_to_Carry", ""),
            "Walk_in_interview": data.get("Walk_in_interview", ""),
            "Company_registration_Link": data.get("Company_registration_Link", ""),
            "College_registration_Link": data.get("College_registration_Link", ""),
            "Note": data.get("Note", ""),
            "From": data.get("From", ""),
            "From_designation": data.get("From_designation", ""),
            "CompanyId": pk,
        }
        # Prepare tableData from related offers (assuming a related field 'offers' exists)
        offers = Offers.objects.filter(
            company=company
        )  # Adjust as per your related name
        table_data = [
            {
                "type": offer.type,
                "salary": offer.stipend,
                "position": offer.position,
            }
            for offer in offers
        ]
        print(table_data)
        # Construct response data
        response_data = {
            **notice_data,
            "tableData": table_data,
        }

        return JsonResponse(
            {"message": "Notice created successfully", "data": response_data},
            status=status.HTTP_201_CREATED,
        )

    except InternshipRegistration.DoesNotExist:
        return JsonResponse(
            {"error": "Company not found."}, status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_notice(request, pk):
    try:
        notice = InternshipNotice.objects.get(id=pk)
        notice = InternshipNoticeSerializer(notice)
        return JsonResponse({"notice": notice.data}, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def job_application(request, pk):
    try:
        user = User.objects.get(email=request.user.email)
        student = Student.objects.get(user=user)
        company = InternshipRegistration.objects.get(pk=pk)
        InternshipApplication.objects.create(
            company=company, id=uuid4(), student=student
        )
        return JsonResponse(
            {"success": "Job application submitted successfully"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_applied_students(request, pk):
    try:
        company = InternshipApplication(pk=pk)
        students = InternshipApplicationSerializer(company)
        print(students.data)
        return JsonResponse({"students": students.data})
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_job_acceptance(request):
    try:
        user = User.objects.get(email=request.user.email)
        if not user:
            return JsonResponse(
                {"error": "Failed to find user"}, status=status.HTTP_404_NOT_FOUND
            )
        student = Student.objects.get(user=user)
        data = request.data
        if not student:
            return JsonResponse(
                {"error": "Failed to find student"}, status=status.HTTP_404_NOT_FOUND
            )
        start_date_str = data.get("startDate")
        end_date_str = data.get("endDate")
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        completion_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        if data.get("selectOption") == "in_house":

            InternshipAcceptance.objects.create(
                student=student,
                year=data.get("year"),
                domain_name=data.get("domain"),
                start_date=start_date,
                completion_date=completion_date,
            )
        else:
            if not request.FILES.get("offerLetter"):
                return JsonResponse(
                    {"error": "Offer letter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            InternshipAcceptance.objects.create(
                student=student,
                year=data.get("year"),
                company_name=data.get("companyName"),
                offer_letter=request.FILES.get("offerLetter"),
                offer_type=data.get("selectOption"),
                salary=float(data.get("stipend")),
                is_verified=False,
                domain_name=data.get("domain"),
                start_date=start_date,
                completion_date=completion_date,
            )
        return JsonResponse({"success": "Job application created"})
    except Exception as e:
        print(e)
        return JsonResponse(
            {"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# @authentication_classes([SessionAuthentication, BasicAuthentication])
@api_view(["GET"])
def get_job_acceptance_by_id(request, pk):
    try:
        job_acceptance = InternshipAcceptance.objects.get(id=pk)
    except InternshipAcceptance.DoesNotExist:
        return JsonResponse(
            {"error": "Job acceptance not found."}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = InternshipAcceptanceSerializer(job_acceptance)
    return JsonResponse(serializer.data)


@api_view(["GET"])
def get_jobs_by_company_name(request, company_name):
    jobs = InternshipAcceptance.objects.filter(company_name=company_name)
    if not jobs.exists():
        return JsonResponse(
            {"error": "No jobs found for this company name."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = InternshipAcceptanceSerializer(jobs, many=True)
    return JsonResponse(serializer.data)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_job_acceptances(request):
    jobs = InternshipAcceptance.objects.filter(is_verified=False).select_related(
        "student"
    )
    serializer = InternshipAcceptanceSerializer(jobs, many=True)
    data = []
    for job in serializer.data:
        job_data = dict(job)
        student = job["student"]
        if student:
            student_obj = Student.objects.get(id=student)
            job_data["student_name"] = (
                student_obj.user.full_name if student_obj.user else ""
            )
            job_data["uid"] = student_obj.uid
        data.append(job_data)

    return JsonResponse(data, safe=False)


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def verify_job(request):
    try:
        job_ids = request.data.get("jobIds", [])
        for job_id in job_ids:
            job = InternshipAcceptance.objects.get(id=job_id)
            job.is_verified = True
            job.save()
        return JsonResponse(
            {"message": "Job verified successfully"}, status=status.HTTP_200_OK
        )
    except InternshipAcceptance.DoesNotExist:
        return JsonResponse(
            {"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND
        )
