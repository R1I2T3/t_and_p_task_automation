from django.urls import path
from .views import DepartmentCoordinatorViewSet, AttendanceViewSet

urlpatterns = [
    # Department Coordinator URLs
    path(
        "",
        DepartmentCoordinatorViewSet.as_view({"get": "list"}),
        name="department-list",
    ),
    path(
        "stats/",
        DepartmentCoordinatorViewSet.as_view({"get": "stats"}),
        name="department-stats",
    ),
    # Attendance URLs
    path(
        "attendance/upload-attendance/",
        AttendanceViewSet.as_view({"post": "upload_attendance"}),
        name="upload-attendance",
    ),
    path(
        "attendance/upload-performance/",
        AttendanceViewSet.as_view({"post": "upload_performance"}),
        name="upload-performance",
    ),
]
