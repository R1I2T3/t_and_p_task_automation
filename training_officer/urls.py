from . import views
from django.urls import path

urlpatterns = [path("", views.TnPStats, name="training_officer_index")]
