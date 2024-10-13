from . import views
from django.urls import path

urlpatterns = [path("", views.internship, name="internship_index")]
