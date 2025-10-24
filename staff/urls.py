from django.urls import path
from .views import (
    CompanyListCreateView,
    CompanyDetailView,
    CompanyByBatchView,
    CompanyBatchesView,
    SendPlacementNotificationApiView,
    PaginatedInterestedStudentsView,
    PaginatedNotInterestedStudentsView,
    EligibleButNotRegisteredView,
    BulkUpdateProgressView,
    TriggerExcelExportView,
    TriggerResumeExportView,
    GetTaskStatusView,
)

urlpatterns = [
    path(
        "placement/company", CompanyListCreateView.as_view(), name="company-list-create"
    ),
    path(
        "placement/company/<str:id>/",
        CompanyDetailView.as_view(),
        name="company-detail",
    ),
    path(
        "placement/companies/batch/<str:batch>/",
        CompanyByBatchView.as_view(),
        name="companies-by-batch",
    ),
    path(
        "companies/batches/",
        CompanyBatchesView.as_view(),
        name="company-batches",
    ),
    path(
        "placement/company/send_notifications/<str:id>/",
        SendPlacementNotificationApiView.as_view(),
        name="send-placement-notifications",
    ),
    path(
        'company/<str:company_id>/interested-students/',
        PaginatedInterestedStudentsView.as_view(),
        name='company-interested-students'
    ),
    path(
        'company/<str:company_id>/not-interested-students/',
        PaginatedNotInterestedStudentsView.as_view(),
        name='company-not-interested-students'
    ),
    path(
        'company/<str:company_id>/eligible-not-registered/',
        EligibleButNotRegisteredView.as_view(),
        name='company-eligible-not-registered'
    ),

    path(
        'company/bulk-update-progress/',
        BulkUpdateProgressView.as_view(),
        name='bulk-update-progress'
    ),

    path(
        'company/<str:company_id>/trigger-excel-export/',
        TriggerExcelExportView.as_view(),
        name='trigger-excel-export'
    ),
    path(
        'company/<str:company_id>/trigger-resume-export/',
        TriggerResumeExportView.as_view(),
        name='trigger-resume-export'
    ),

    path(
        'task-status/<str:task_id>/',
        GetTaskStatusView.as_view(),
        name='get-task-status'
    ),
]
