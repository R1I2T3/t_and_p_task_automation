from django.urls import path
from . import views
from .views import CreateAttendanceRecord

urlpatterns = [
    # Route to fetch attendance data from dynamic table
    path(
        "attendance/<str:table_name>/",
        views.get_attendance_data,
        name="get_attendance_data",
    ),
    # Route to save branch-wise attendance (POST method) with dynamic table name
    path(
        "save-branch-attendance/<str:table_name>/",
        views.save_branch_attendance,
        name="save_branch_attendance",
    ),
    # Route to fetch average attendance and performance data with dynamic table name
    path("average-data/<str:table_name>/", views.get_avg_data, name="get_avg_data"),
    # Route to update attendance data dynamically
    path(
        "attendance/update/<str:table_name>/",
        views.update_attendance,
        name="update_attendance",
    ),
    # Route to create a new attendance record
    path(
        "create-attendance-record/",
        CreateAttendanceRecord.as_view(),
        name="create-attendance-record",
    ),
    path("upload-data/", views.upload_data, name="upload_data"),
]
