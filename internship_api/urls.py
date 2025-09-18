from django.urls import path
from .views import (
    create_company_with_offers,
    get_all_companies,
    get_company_with_offers,
    job_application,
    get_all_applied_students,
    create_job_acceptance,
    get_all_job_acceptances,
    verify_job,
)

urlpatterns = [
    path("company/register/", create_company_with_offers),
    path("company/", get_all_companies),
    path("company/<str:pk>", get_company_with_offers),
    path("job_application/create/<str:pk>", job_application),
    # path("job_application/get/<str:uid>", get_student_application),
    path("job_application/company/get/<str:pk>", get_all_applied_students),
    path("job_acceptance/create/", create_job_acceptance),
    path("jobs/verify/", get_all_job_acceptances, name="internship-acceptance"),
    path("jobs/verify/selected/", verify_job, name="verify-internship"),
]
