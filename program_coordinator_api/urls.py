from django.urls import path
from . import views
from .views import CreateAttendanceRecord

urlpatterns = [
    # ---------------- Attendance APIs ----------------
    path("attendance/<str:table_name>/", views.get_attendance_data, name="get_attendance_data"),
    path("save-branch-attendance/<str:table_name>/", views.save_branch_attendance, name="save_branch_attendance"),
    path("average-data/<str:table_name>/", views.get_avg_data, name="get_avg_data"),
    path("attendance/update/<str:table_name>/", views.update_attendance, name="update_attendance"),
    path("create-attendance-record/", CreateAttendanceRecord.as_view(), name="create-attendance-record"),
    path("upload-data/", views.upload_data, name="upload_data"),

    # ---------------- Training Performance APIs ----------------
    path("training-performance/headers/<str:training_type>/", views.get_training_headers, name="training_headers"),
    path("training-performance/template/<str:training_type>/", views.download_training_template, name="training_template"),
    path("training-performance/upload/", views.upload_training_performance, name="training_upload"),
]
