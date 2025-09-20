from django.urls import path
from .views import CompanyListCreateView, CompanyDetailView, CompanyByBatchView

urlpatterns = [
    path(
        "placement/company", CompanyListCreateView.as_view(), name="company-list-create"
    ),
    path(
        "placement/company/<str:name>/<str:batch>/",
        CompanyDetailView.as_view(),
        name="company-detail",
    ),
    path(
        "placement/company/batch/<str:batch>/",
        CompanyByBatchView.as_view(),
        name="companies-by-batch",
    ),
]
