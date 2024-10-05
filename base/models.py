from django.contrib.auth.models import AbstractBaseUser, UserManager, PermissionsMixin
from django.db import models
import uuid
from django.core.mail import send_mail
from django.conf import settings


class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("You have not provided a valid e-mail address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        print("Hello")
        try:
            send_mail(
                "Subject here",
                f"Your account is created. Your username is {email} and your password is tcet@1234. Please change your password after login.",
                settings.EMAIL_HOST_USER,  # Use settings.EMAIL_HOST_USER as the from email
                [email],  # Recipient list should be a list of email addresses
                fail_silently=False,  # Make sure to catch actual errors
            )
        except Exception as e:
            print(f"Error sending email: {e}")
        user.save(using=self._db)
        print(user)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "system_admin")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    USER_ROLE_TYPE = [
        ("student", "student"),
        ("system_admin", "system_admin"),
        ("principal", "principal"),
        ("department_coordinator", "department_coordinator"),
        ("program_coordinator", "program_coordinator"),
        ("training_officer","placement_officer"),
        ("internship_officer","internship_officer"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    role = models.TextField(choices=USER_ROLE_TYPE)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        app_label = "base"

    def get_full(self):
        return self.full_name
