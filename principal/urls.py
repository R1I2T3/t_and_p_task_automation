from django.urls import path
from . import views

urlpatterns = [
    path("", views.TnPStats, name="principal_index"),
    path("training_2023/", views.training2023, name="principal_training_2023"),
    path("internship_2022/", views.internship_2022, name="principal_internship_2022"),
    path("internship/", views.internship, name="principal_internship"),
    path("placement/", views.placement, name="principal_placement"),
]
