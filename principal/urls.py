from django.urls import path
from . import views

urlpatterns = [
    path("", views.TnPStats),
    path("internship", views.internship),
]
