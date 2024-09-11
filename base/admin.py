from django.contrib.admin import register
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import User
from unfold.admin import ModelAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm


class CustomUserCreationForm(UserCreationForm):
    """Form for creating new users. Includes all the required fields, plus a repeated password field."""

    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Password confirmation", widget=forms.PasswordInput
    )

    class Meta:
        model = User
        fields = ("email", "full_name", "role")

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class CustomUserChangeForm(UserChangeForm):
    """Form for updating users. Replaces the password field with a password hash display."""

    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("email", "password", "full_name", "role", "is_staff", "is_superuser")

    def clean_password(self):
        # Return the initial value, regardless of what the user provides
        return self.initial["password"]


@register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    change_password_form = AdminPasswordChangeForm
    ordering = ["email"]
    list_display = ["email", "full_name", "role"]
    list_filter = ["role", "is_superuser"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name", "role")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_superuser",
                    "is_staff",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "full_name",
                    "role",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
