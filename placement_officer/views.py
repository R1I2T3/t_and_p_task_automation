from django.shortcuts import render, HttpResponse
from django.db.models import Count, Sum, Avg, Max, Min
from django.http import JsonResponse
import json
from student.models import Student
from placement_api.models import Offers, CompanyRegistration, jobAcceptance
from django.views.decorators.csrf import ensure_csrf_cookie
import re
from datetime import datetime


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


def extract_year_from_uid(uid):
    """Extract batch year from UID."""
    try:
        return int(uid.split("-")[-1]) + 2000
    except ValueError:
        return None


# Returns the current year
def get_current_year():
    """Get the current year."""
    return datetime.now().year


def statistic(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        consent_graph = list(
            Student.objects.filter(uid__regex=f"^.*-{batch_year_suffix}$")
            .values("consent")
            .annotate(count=Count("consent"))
        )
        consent_counts_by_branch = list(
            Student.objects.filter(uid__regex=f"^.*-{batch_year_suffix}$")
            .values("department")
            .annotate(count=Count("consent"))
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


def filter_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        filtered_data = list(
            Student.objects.filter(
                department=department, uid__regex=f"^.*-{batch_year_suffix}$"
            )
            .values("consent")
            .annotate(count=Count("consent"))
        )
    except Exception as e:
        print(f"Error filtering data by department: {e}")
        filtered_data = []

    return JsonResponse({"filtered_data": json.dumps(filtered_data)})


def get_unique_departments(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        unique_departments = list(
            Student.objects.filter(uid__regex=f"^.*-{batch_year_suffix}$")
            .values_list("department", flat=True)
            .distinct()
        )
    except Exception as e:
        print(f"Error fetching unique departments: {e}")
        unique_departments = []

    return JsonResponse({"unique_departments": unique_departments})


def get_category(request, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        category = list(
            Student.objects.filter(uid__regex=f"^.*-{batch_year_suffix}$")
            .values("current_category")
            .annotate(count=Count("current_category"))
        )
    except Exception as e:
        print(f"Error fetching category data: {e}")
        category = []

    return JsonResponse({"category": category})


def get_category_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        category = list(
            Student.objects.filter(
                department=department, uid__regex=f"^.*-{batch_year_suffix}$"
            )
            .values("current_category")
            .annotate(count=Count("current_category"))
        )
    except Exception as e:
        print(f"Error filtering category by department: {e}")
        category = []
    return JsonResponse({"category": category})


def get_all_companies(request):
    try:
        companies = list(
            CompanyRegistration.objects.values_list("name", flat=True).distinct()
        )
    except Exception as e:
        print(f"Error fetching company names: {e}")
        companies = []
    return JsonResponse({"companies": companies})


def get_offers_by_department(request, department, year=None):
    year = year or get_current_year()
    batch_year_suffix = str(year)[-2:]
    try:
        offer_ids = Student.objects.filter(
            department=department, uid__regex=f"^.*-{batch_year_suffix}$"
        ).values_list("uid", flat=True)
        offers = list(
            Offers.objects.filter(id__in=offer_ids)
            .values("company__name")
            .annotate(count=Count("id"))
        )
    except Exception as e:
        print(f"Error fetching offers by department: {e}")
        offers = []
    return JsonResponse({"offers": offers})


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


def consolidated(request):
    try:
        acceptances = jobAcceptance.objects.all()
        placed_students = acceptances.values("student").distinct().count()
        total_accepted_offers = acceptances.count()
        total_salary_accepted = acceptances.aggregate(total_salary=Sum("salary"))[
            "total_salary"
        ]
        avg_salary_accepted = acceptances.aggregate(avg_salary=Avg("salary"))[
            "avg_salary"
        ]
        max_salary_accepted = acceptances.aggregate(max_salary=Max("salary"))[
            "max_salary"
        ]
        min_salary_accepted = acceptances.aggregate(min_salary=Min("salary"))[
            "min_salary"
        ]
        company_data = {}
        companies = CompanyRegistration.objects.values("name").distinct()
        for company in companies:
            company_name = company["name"]
            branches = (
                acceptances.filter(company__name=company_name)
                .values("student__department")
                .distinct()
            )
            branch_data = {}
            for branch in branches:
                branch_name = branch["student__department"]
                branch_data[branch_name] = acceptances.filter(
                    company__name=company_name, student__department=branch_name
                ).count()
            company_data[company_name] = branch_data
        student_data = list(
            acceptances.values(
                "student__uid", "student__department", "company__name", "salary"
            )
        )
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
    except Exception as e:
        print(f"Error in consolidated_view: {e}")
        context = {
            "total_placed_students": 0,
            "total_accepted_offers": 0,
            "total_salary_accepted": 0,
            "avg_salary_accepted": 0,
            "max_salary_accepted": 0,
            "min_salary_accepted": 0,
            "company_data": {},
            "student_data": [],
        }
    return JsonResponse(context)
