from django.shortcuts import render, HttpResponse
from django.db.models import Count, Sum, Avg, Max, Min,F
from django.http import JsonResponse
import json
from student.models import Student
from placement_api.models import Offers, CompanyRegistration, jobAcceptance
from django.views.decorators.csrf import ensure_csrf_cookie
import re
from datetime import datetime
from student.utils import categorize
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_top_companies_with_offers(request):
    try:
        top_companies = list(
            Offers.objects.values("company__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
    except Exception as e:
        print(f"Error fetching top companies with offers: {e}")
        top_companies = []

    return JsonResponse({"top_companies": top_companies})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def extract_year_from_uid(uid):
    """Extract batch year from UID."""
    try:
        return int(uid.split("-")[-1]) + 2000
    except ValueError:
        return None


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_current_year():
    """Get the current year."""
    return datetime.now().year


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def statistic(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        consent_graph = list(
            Student.objects.all().values("consent").annotate(count=Count("consent"))
        )
        consent_counts_by_branch = list(
            Student.objects.all().values("department").annotate(count=Count("consent"))
        )
    except Exception as e:
        print(f"Error reading data from database: {e}")
        consent_graph = []
        consent_counts_by_branch = []

    context = {
        "consent_graph": json.dumps(consent_graph),
        "consent_counts_by_branch": json.dumps(consent_counts_by_branch),
    }
    return JsonResponse(context)


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def filter_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        filtered_data = list(
            Student.objects.filter(department=department)
            .values("consent")
            .annotate(count=Count("consent"))
        )
    except Exception as e:
        print(f"Error filtering data by department: {e}")
        filtered_data = []

    return JsonResponse({"filtered_data": json.dumps(filtered_data)})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_unique_departments(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        unique_departments = list(
            Student.objects.all().values_list("department", flat=True).distinct()
        )
    except Exception as e:
        print(f"Error fetching unique departments: {e}")
        unique_departments = []

    return JsonResponse({"unique_departments": unique_departments})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_category(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        category = list(
            Student.objects.filter(academic_year="BE")
            .values("current_category")
            .annotate(count=Count("current_category"))
        )
    except Exception as e:
        print(f"Error fetching category data: {e}")
        category = []

    return JsonResponse({"category": category})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_category_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        category = list(
            Student.objects.filter(department=department)
            .values("current_category")
            .annotate(count=Count("current_category"))
        )
    except Exception as e:
        print(f"Error filtering category by department: {e}")
        category = []
    return JsonResponse({"category": category})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_all_companies(request):
    try:
        companies = list(
            CompanyRegistration.objects.values_list("name", flat=True).distinct()
        )
    except Exception as e:
        print(f"Error fetching company names: {e}")
        companies = []
    return JsonResponse({"companies": companies})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_offers_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        offer_ids = Student.objects.filter(
            department__startswith=department,
        ).values_list("uid", flat=True)
        print(f"Offer IDs: {offer_ids}")
        offers = list(
            Offers.objects.filter(id__in=offer_ids)
            .values("company__name")
            .annotate(count=Count("id"))
        )
    except Exception as e:
        print(f"Error fetching offers by department: {e}")
        offers = []
    return JsonResponse({"offers": offers})


@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def get_data_by_year(request, year):
    try:
        batch_year_suffix = str(year)[-2:]
        students = Student.objects.filter(uid__regex=f"^.*-{batch_year_suffix}$")
        student_data = list(students.values("uid", "department", "consent"))
        print(f"Students for year {year}: {student_data}")
    except Exception as e:
        print(f"Error fetching data for year {year}: {e}")
        student_data = []
    return JsonResponse({"data": student_data})




@api_view(["GET"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def consolidated(request):
    try:
        acceptances = jobAcceptance.objects.all()

        # Get the total number of distinct placed students
        placed_students = acceptances.values("student").distinct().count()

        # Get total number of accepted offers
        total_accepted_offers = acceptances.count()

        # Get the total salary accepted
        total_salary_accepted = acceptances.aggregate(total_salary=Sum("salary"))["total_salary"]

        # Get average salary accepted
        avg_salary_accepted = acceptances.aggregate(avg_salary=Avg("salary"))["avg_salary"]

        # Get the maximum salary accepted
        max_salary_accepted = acceptances.aggregate(max_salary=Max("salary"))["max_salary"]

        # Get the minimum salary accepted
        min_salary_accepted = acceptances.aggregate(min_salary=Min("salary"))["min_salary"]

        # Prepare company data with branch-wise statistics
        company_data = {}
        companies = CompanyRegistration.objects.values("name").distinct()

        for company in companies:
            company_name = company["name"]
            
            # Get distinct branches for the company
            branches = acceptances.filter(company__name=company_name).values("student__department").distinct()
            print(f"Branches for company {company_name}: {branches}")

            branch_data = {}
            for branch in branches:
                branch_name = branch["student__department"]

                # Fetching selected students where is_sel=1 (True in TinyInt)
                selected = acceptances.filter(
                    company__name=company_name,
                    student__department=branch_name,
                    is_sel=1  # Checking for TinyInt value 1 (True)
                ).count()

                # Fetching registered students where is_reg=1 (True in TinyInt)
                registered = acceptances.filter(
                    company__name=company_name,
                    student__department=branch_name,
                    is_reg=1  # Checking for TinyInt value 1 (True)
                ).count()

                # Store selected and registered count in the branch data
                branch_data[branch_name] = {
                    "selected": selected,
                    "registered": registered
                }

            # Adding the total selected and registered for each company
            company_data[company_name] = {
                "branch_data": branch_data,
                "total_selected": sum(branch["selected"] for branch in branch_data.values()),
                "total_registered": sum(branch["registered"] for branch in branch_data.values())
            }

        # Fetching student data (student UID, department, company name, and salary)
        student_data = list(
            acceptances.values(
                "student__uid",
                "student__department",
                "company__name",
                "salary",
                "company__is_pli"
            )
        )

        # Prepare the final context to return as JSON response
        context = {
            "total_placed_students": placed_students,
            "total_accepted_offers": total_accepted_offers,
            "total_salary_accepted": total_salary_accepted,
            "avg_salary_accepted": avg_salary_accepted,
            "max_salary_accepted": max_salary_accepted,
            "min_salary_accepted": min_salary_accepted,
            "company_data": company_data,
            "student_data": student_data,
        }

        # Return the context as JSON response with status 200
        return JsonResponse(context, status=200)

    except Exception as e:
        # Handle any exceptions and return a JSON response with error details
        print(f"[ERROR] consolidated view: {str(e)}")
        return JsonResponse(
            {
                "error": "Internal server error occurred while generating report.",
                "details": str(e)
            },
            status=500
        )



@api_view(["POST"])
@authentication_classes([SessionAuthentication, BasicAuthentication])
@permission_classes([IsAuthenticated])
def calculateCategory(request):
    try:
        students = Student.objects.filter(academic_year="BE")
        for student in students:
            academic_attendance_sum = student.academic_attendance.aggregate(Sum("attendance")).get("attendance__sum")  # type: ignore
            academic_attendance = (
                academic_attendance_sum / student.academic_attendance.count()
                if academic_attendance_sum is not None
                else None
            )
            academic_performance_sum = student.academic_performance.aggregate(Sum("performance")).get("performance__sum")  # type: ignore
            academic_performance = (
                academic_performance_sum / student.academic_performance.count()
                if academic_performance_sum is not None
                else None
            )
            training_attendance_sum = student.training_attendance.aggregate(Sum("training_attendance")).get("training_attendance__sum")  # type: ignore
            training_attendance = (
                training_attendance_sum / student.training_attendance.count()
                if training_attendance_sum is not None
                else None
            )
            training_performance_sum = student.training_performance.aggregate(Sum("training_performance")).get("training_performance__sum")  # type: ignore
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
            )
            student.current_category = category
            student.save()
        return JsonResponse({"success": "Category calculated successfully"}, status=200)
    except Exception as e:
        print(e)
        JsonResponse({"error": "Error in calculating category"}, status=500)
