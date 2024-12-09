from django.urls import path
from .views import SingleForm, FormList

urlpatterns = [
    path("form/get/<str:pk>/", SingleForm.as_view(), name="single_form_operation"),
    path("form/create/", FormList.as_view(), name="form_list"),
]
