from django.urls import path
from . import views

urlpatterns = [
    path("", views.TnPStats, name="principal_index"),
    path("internship/", views.internship, name="principal_internship"),
]
