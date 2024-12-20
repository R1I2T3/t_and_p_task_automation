"""
URL configuration for t_and_p_automation project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import my_protected_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index),
    path("principal/", include("principal.urls")),
    path("department_coordinator/", include("department_coordinator.urls")),
    path("", include("base.urls")),
    path("placement_officer/", include("placement_officer.urls")),
    path("student/", include("student.urls")),
    path("program_coordinator/", include("program_coordinator.urls")),
    path("internship_officer/", include("internship_officer.urls")),
    path("training_officer/", include("training_officer.urls")),
    path("api/", include("forms.urls")),
    path("api/placement/", include("placement_api.urls")),
    path("api/", views.my_protected_view, name="check-auth"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
