from django.urls import path
from .views import (
    company_register,
    get_all_companies,
    get_company_with_offers,
    create_notice,
    get_notice,
    job_application,
    get_student_application,
    get_all_applied_students,
    create_job_acceptance,
    SaveAttendance,
)

urlpatterns = [
    path("company/register/<str:safe>", company_register),
    path("company/", get_all_companies),
    path("company/<str:pk>", get_company_with_offers),
    path("notice/create/<str:pk>", create_notice),
    path("notice/get/<str:pk>", get_notice),
    path("job_application/create/<str:pk>", job_application),
    path("job_application/get/<str:uid>", get_student_application),
    path("job_application/company/get/<str:pk>", get_all_applied_students),
    path("job_acceptance/create", create_job_acceptance),
    path("save/", SaveAttendance.as_view(), name="save_to_database"),
]
