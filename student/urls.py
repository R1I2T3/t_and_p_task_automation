from django.urls import path
from .views import HomeAPIView, SdPAPIView, ResumeView, SessionAttendanceAPIView, StudentFormView,StudentDataView

urlpatterns = [
    path("", HomeAPIView.as_view(), name="home-api"),
    path("info/", SdPAPIView.as_view(), name="sdp-api"),
    path("resume/", ResumeView.as_view(), name="resume-api"),
    path("attendance-data/", SessionAttendanceAPIView.as_view(), name="attendance-api"),
    path("consent/<int:id>", StudentFormView.as_view(), name="consent-api"),
    path("pli/<int:id>", StudentFormView.as_view(), name="pli-api"),
    path("student-data/", StudentDataView.as_view(), name="student-data-api"),
]
