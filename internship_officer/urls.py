from . import views
from django.urls import path

urlpatterns = [
    path("", views.internship, name="internship_index"),
    path(
        "internship_2022/",
        views.internship_2022,
        name="internship_officer_internship_2022",
    ),
    path(
        "internship_2023/",
        views.internship_2023,
        name="internship_officer_internship_2023",
    ),
]
