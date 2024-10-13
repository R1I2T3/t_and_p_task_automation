from . import views
from django.urls import path, include

urlpatterns = [
    path("", views.home, name="student_home"),
    path("studentCE", views.sdCE, name="student company engagement"),
    path("studentProfile", views.sdP, name="student_profile"),
    path("studentNotification", views.sdNC, name="student_notification"),
    path("studentGreivance", views.sdGO, name="student_greivance"),
]
