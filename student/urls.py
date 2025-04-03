from django.urls import path
from .views import HomeAPIView, SdPAPIView, ResumeView, SessionAttendanceAPIView

urlpatterns = [
    path("", HomeAPIView.as_view(), name="home-api"),
    path("info/", SdPAPIView.as_view(), name="sdp-api"),
    path("resume/", ResumeView.as_view(), name="resume-api"),
    path("attendance-data/", SessionAttendanceAPIView.as_view(), name="attendance-api"),
]
