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
    get_all_job_acceptances,
    verify_job,
    SaveAttendance,
    delete_notice,
    get_notice_id,
)

urlpatterns = [
    path("company/register/<str:safe>", company_register),
    path("company/all", get_all_companies),
    path("company/<str:pk>", get_company_with_offers),
    path("notice/create/<str:pk>", create_notice),
    path("notice/get/<str:pk>/", get_notice),
    path("notice/get_id/", get_notice_id),
    path("notice/delete/<str:notice_id>/", delete_notice),
    path("job_application/create/<str:pk>/", job_application),
    path("job_application/get/<str:uid>/", get_student_application),
    path("job_application/company/get/<str:pk>/", get_all_applied_students),
    path("job_acceptance/create/", create_job_acceptance),
    path("jobs/verify", get_all_job_acceptances, name="job-acceptance"),
    path("jobs/verify/selected/", verify_job, name="verify-job"),
    path("attendance/save/", SaveAttendance.as_view(), name="save_to_database"),
]
