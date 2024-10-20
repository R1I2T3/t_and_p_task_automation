from . import views
from django.urls import path

urlpatterns = [
    path("", views.TnPStats, name="training_officer_index"),
    path("training2023/", views.training2023, name="training2023"),
]
