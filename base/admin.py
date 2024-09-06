# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class CustomUserAdmin(BaseUserAdmin):
    # Fields to display in the list view of the admin
    list_display = ("email", "full_name", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")  # Use existing fields

    # Fieldsets to be displayed on the user detail/edit page
    fieldsets = (
        (None, {"fields": ("email", "full_name", "role", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        # Note: 'last_login' and 'date_joined' are not in your model, so they are removed
    )  #
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "role", "password1", "password2"),
            },
        ),
    )
    ordering = ("email",)
    search_fields = ("email", "full_name")


admin.site.register(User, CustomUserAdmin)
