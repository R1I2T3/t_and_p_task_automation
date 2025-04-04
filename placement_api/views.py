from django.http import JsonResponse
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
    parser_classes,
)
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework import status
from .models import CompanyRegistration, Offers, placementNotice, jobAcceptance
from .serializers import (
    CompanyRegistrationSerializer,
    OffersSerializer,
    PlacementNoticeSerializer,
    JobAcceptanceSerializer,
    JobApplicationSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from base.models import User
from django.views.decorators.csrf import csrf_exempt
from student.models import Student
from .models import jobApplication
from uuid import uuid4
from student.serializers import StudentSerializer
from rest_framework.exceptions import NotFound
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from uuid import uuid4
from .utils import is_student_eligible

@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_notice_id(request):
    try:
        sr_no = request.data.get("srNo")
        company_id = request.data.get("company")

        if not sr_no or not company_id:
            return JsonResponse(
                {"error": "srNo and company are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Log the input data
        print(f"Fetching notice ID for srNo: {sr_no}, companyId: {company_id}")

        # Query the database
        notice = placementNotice.objects.filter(srNo=sr_no, company__id=company_id).first()

        # Log the query result
        if notice:
            print(f"Notice found - ID: {notice.id}")
            return JsonResponse({"id": str(notice.id)}, status=status.HTTP_200_OK)
        else:
            print("Notice not found.")
            return JsonResponse(
                {"error": "Notice not found."}, status=status.HTTP_404_NOT_FOUND
            )

    except Exception as e:
        print(f"Error in get_notice_id: {str(e)}")
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["DELETE"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def delete_notice(request, notice_id):
    try:
        # Fetch all notices
        notices = placementNotice.objects.all()
        print(f"Total notices fetched: {len(notices)}")

        # Find the notice to delete
        notice_to_delete = next((notice for notice in notices if str(notice.id) == notice_id), None)

        if not notice_to_delete:
            print(f"No notice found with ID: {notice_id}")
            return JsonResponse({"error": "Notice not found."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the notice
        notice_to_delete.delete()
        print(f"Notice with ID {notice_id} deleted successfully.")
        return JsonResponse({"message": "Notice deleted successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in delete_notice: {str(e)}")
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_notices(request):
    try:
        notices = placementNotice.objects.all()
        data = PlacementNoticeSerializer(notices, many=True).data
        return JsonResponse({"notices": data}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in get_all_notices: {str(e)}")
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


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_companies(request):
    try:
        companies = CompanyRegistration.objects.all()
        companies_list = list(companies.values())
        return JsonResponse(companies_list, safe=False)
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_notice(request, pk):
    try:
        company = CompanyRegistration.objects.get(id=pk)  # Ensure company exists
        
        data = request.data.copy()  # Create a mutable copy
        data["company"] = company.id  # Assign only the company ID (not object)
        
        # Use serializer to validate and save data
        notice_serializer = PlacementNoticeSerializer(data=data)
        if notice_serializer.is_valid():
            notice = notice_serializer.save()  # Save data to DB
        else:
            return JsonResponse(
                notice_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve related offers
        offers = Offers.objects.filter(company=company)
        table_data = [
            {
                "type": offer.type,
                "salary": offer.salary,
                "position": offer.position,
            }
            for offer in offers
        ]

        # Construct only the necessary response data
        notice_data = {
            "company": company.id,  # Pass only ID, not the object
            "srNo": data.get("srNo", ""),
            "date": data.get("date", ""),
            "to": data.get("to", ""),
            "subject": data.get("subject", ""),
            "intro": data.get("intro", ""),  # Fix key case
            "eligibility_criteria": data.get("eligibility_criteria", ""),  # Fix key case
            "about": data.get("about", ""),  # Fix key case
            "location": data.get("location", ""),
            "Documents_to_Carry": data.get("Documents_to_Carry", ""),
            "Walk_in_interview": data.get("Walk_in_interview", ""),
            "Company_registration_Link": data.get("Company_registration_Link", ""),
            "College_registration_Link": data.get("College_registration_Link", ""),
            "Note": data.get("Note", ""),
            "From": data.get("From", ""),
            "From_designation": data.get("From_designation", ""),
            "companyId": pk,
            "tableData": table_data,  # Include tableData
        }

        return JsonResponse(
            {"message": "Notice successfully created", "data": notice_data},
            status=status.HTTP_201_CREATED,
        )

    except CompanyRegistration.DoesNotExist:
        return JsonResponse(
            {"error": "Company not found."}, status=status.HTTP_404_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["POST"])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def company_register(request, safe):
    try:
        data = request.data
        print(data)
        company_data = data.get("company")
        company_serializer = CompanyRegistrationSerializer(data=company_data)
        if company_serializer.is_valid():
            company = company_serializer.save()
            print(company)
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
def get_notice(request, pk):
    try:
        notice = placementNotice.objects.get(id=pk)
        notice_data = PlacementNoticeSerializer(notice).data
        return JsonResponse(notice_data, status=status.HTTP_200_OK)
    except placementNotice.DoesNotExist:
        return JsonResponse(
            {"error": "Notice not found"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def job_application(request, pk):
    try:
        company_id = pk
        data = request.data
        offer_id = data.get("offer_id")
        if not offer_id:
            return JsonResponse(
                {"error": "Invalid parameters: offer_id and student_uid are required."},
                status=status.HTTP_404_NOT_FOUND,
            )
        offer_id = data.get("offer_id")
        if not offer_id or not company_id:
            return JsonResponse({"error": "Missing uid or company_id"}, status=400)
        student = Student.objects.get(user=request.user)

        company = CompanyRegistration.objects.get(id=company_id)
        offer = Offers.objects.get(id=offer_id)
        if not is_student_eligible(company, student):
            return JsonResponse(
                {"error": "Student is not eligible for the offer."}, status=401
            )
        job_application = jobApplication(
            id=uuid4(),
            student=student,
            company=company,
            offer=offer,
        )
        job_application.save()

        return JsonResponse(
            {"message": "Job application created successfully"}, status=201
        )
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)
    except CompanyRegistration.DoesNotExist:
        return JsonResponse({"error": "Company not found"}, status=404)
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_student_application(request, uid):
    try:
        student = Student.objects.get(uid=uid)
    except Student.DoesNotExist:
        raise NotFound("Student not found.")

    serializer = StudentSerializer(student)
    return JsonResponse({"student": serializer.data}, safe=False)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_applied_students(request, pk):
    try:
        company = CompanyRegistration(pk=pk)
        applications = jobApplication.objects.filter(company=company).select_related(
            "student"
        )
        students_data = [
            {
                "id": str(app.id),
                "student": app.student.user.full_name if app.student.user else "",
                "company": app.company.name if app.company else "",
                "attendance": app.attendance if hasattr(app, "attendance") else False,
                "aptitude": app.aptitude if hasattr(app, "aptitude") else False,
                "gd": app.gd if hasattr(app, "gd") else False,
                "case_study": app.case_study if hasattr(app, "case_study") else False,
                "hr_round": app.hr_round if hasattr(app, "hr_round") else False,
            }
            for app in applications
        ]
        return JsonResponse({"students": students_data})
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
    user = User.objects.get(email=request.user.email)
    if not user:
        return JsonResponse(
            {"error": "Failed to find user"}, status=status.HTTP_404_NOT_FOUND
        )
    student = Student.objects.get(user=user)
    if not student:
        return JsonResponse(
            {"error": "Failed to find student"}, status=status.HTTP_404_NOT_FOUND
        )
    submittedOffer = jobAcceptance.objects.filter(student=student)
    if len(submittedOffer) > 0:
        return JsonResponse(
            {"error": "Student has already submitted an offer letter"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    company = None
    required_fields = ["type", "salary", "position"]
    for field in required_fields:
        if field not in request.data:
            return JsonResponse(
                {"error": f"Missing required field: {field}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    if "offer_letter" not in request.FILES:
        return JsonResponse(
            {"error": "Offer letter file is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    job_acceptance = jobAcceptance.objects.create(
        id=uuid4(),
        student=student,
        company=None,
        company_name=request.data[
            "company_name"
        ],  # Assuming company has company_name field
        offer_letter=request.FILES["offer_letter"],
        type=request.data["type"][0],
        salary=float(request.data["salary"]),
        position=request.data["position"],
        isVerified=False,  # Default value
    )
    return JsonResponse({"success": "Job application created"})


@authentication_classes([SessionAuthentication, BasicAuthentication])
@api_view(["GET"])
def get_job_acceptance_by_id(request, pk):
    try:
        job_acceptance = jobAcceptance.objects.get(id=pk)
    except jobAcceptance.DoesNotExist:
        return JsonResponse(
            {"error": "Job acceptance not found."}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = JobAcceptanceSerializer(job_acceptance)
    return JsonResponse(serializer.data)


@api_view(["GET"])
def get_jobs_by_company_name(request, company_name):
    jobs = jobAcceptance.objects.filter(company_name=company_name)
    if not jobs.exists():
        return JsonResponse(
            {"error": "No jobs found for this company name."},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = JobAcceptanceSerializer(jobs, many=True)
    return JsonResponse(serializer.data)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_job_acceptances(request):
    jobs = jobAcceptance.objects.filter(isVerified=False).select_related("student")
    serializer = JobAcceptanceSerializer(jobs, many=True)
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
            job = jobAcceptance.objects.get(id=job_id)
            job.isVerified = True
            job.save()
        return JsonResponse(
            {"message": "Job verified successfully"}, status=status.HTTP_200_OK
        )
    except jobAcceptance.DoesNotExist:
        return JsonResponse(
            {"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND
        )


class SaveAttendance(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Expecting a list of job application data
        data = request.data
        try:
            # Iterate through the data and create or update job applications
            for item in data:
                serializer = jobApplication.objects.update(
                    attendance=item.get("attendance", False),
                    aptitude=item.get("aptitude", False),
                    gd=item.get("gd", False),
                    case_study=item.get("case_study", False),
                    hr_round=item.get("hr_round", False),
                )

            return JsonResponse(
                {"message": "Data saved successfully!"}, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print(e)
            return JsonResponse(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )