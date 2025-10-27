from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    # Training Performance APIs
    path(
        "training-performance/template/<str:training_type>/",
        views.download_training_template,
        name="training_template"
    ),
    path(
        "training-performance/upload/",
        csrf_exempt(views.upload_training_performance),  # temporarily exempt from CSRF
        name="training_upload"
    ),

    # Attendance data APIs
    path(
        "get-attendance/<str:table_name>/",
        views.get_attendance_data,
        name="get_attendance_data"
    ),
    path(
        "save-branch-attendance/<str:table_name>/",
        csrf_exempt(views.save_branch_attendance),  # exempt if called from frontend
        name="save_branch_attendance"
    ),
    path(
        "avg-data/<str:table_name>/",
        views.get_avg_data,
        name="get_avg_data"
    ),
    path(
        "update-attendance/<str:table_name>/",
        csrf_exempt(views.update_attendance),
        name="update_attendance"
    ),

    # Data upload & creation APIs
    path(
        "upload-data/",
        csrf_exempt(views.upload_data),
        name="upload_data"
    ),
    path(
        "create-attendance-record/",
        csrf_exempt(views.CreateAttendanceRecord.as_view()),
        name="create_attendance_record"
    ),
]
