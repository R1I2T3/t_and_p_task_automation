from django.urls import path
from . import views
urlpatterns = [
    path("", views.index, name="program_coordinator_index"),
    path("attendance/", views.attendance, name="program_coordinator_attendance"),
]
