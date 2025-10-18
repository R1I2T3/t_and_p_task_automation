from django.urls import path
from .views import CompanyListCreateView, CompanyDetailView, CompanyByBatchView,CompanyBatchesView,SendPlacementNotificationApiView

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
]
