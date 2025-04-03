from django.urls import path
from .views import ResourceListCreate, ResourceDetail

urlpatterns = [
    path("", ResourceListCreate.as_view(), name="resource-list-create"),
    path("<int:pk>/", ResourceDetail.as_view(), name="resource-detail"),
]
