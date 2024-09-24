from django.urls import path
from . import views

urlpatterns = [
    path("",views.index,name='department_coordinator_index'),
    path("stats/",views.stats,name='department_coordinator_stats'),
    path("attendance/",views.stats,name='department_coordinator_attendance'),
]