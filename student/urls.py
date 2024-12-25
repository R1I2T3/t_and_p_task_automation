from django.urls import path
from .views import HomeAPIView, SdPAPIView

urlpatterns = [
    path("", HomeAPIView.as_view(), name="home-api"),
    path("info/", SdPAPIView.as_view(), name="sdp-api"),
]
