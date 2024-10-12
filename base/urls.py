from django.urls import path
from . import views

urlpatterns = [
    path("auth/login/", views.login, name="login"),
    path("auth/verify-otp/", views.verify_otp, name="verify_otp"),
    path(
        "auth/password_reset/",
        views.password_reset_request,
        name="password_reset_request",
    ),
    path(
        "auth/password_reset/verify_otp/",
        views.password_reset_verify_otp,
        name="password_reset_verify_otp",
    ),
    path(
        "auth/password_reset/confirm/",
        views.password_reset_confirm,
        name="password_reset_confirm",
    ),
    path("auth/logout/", views.logout_view, name="logout"),
    path("profile", views.user_profile, name="user_profile"),
    path(
        "profile/update_password",
        views.password_update,
        name="user_profile_update_password",
    ),
]
