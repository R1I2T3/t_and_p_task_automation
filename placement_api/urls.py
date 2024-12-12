from django.urls import path
from .views import (
    create_company_with_offers,
    get_all_companies,
    get_company_with_offers,
)

urlpatterns = [
    path("company/register/", create_company_with_offers),
    path("company/", get_all_companies),
    path("company/<str:pk>", get_company_with_offers),
]
