from django.db import models
from base.models import User
# Create your models here.


class Student(models.Model):
    category_Type = [
        ("Category 1", "category 1"),
        ("Category 2", "category 2"),
        ("Category 3", "category 3"),
    ]
    consent_Type = [
        ("placement", "placement"),
        ("Higher studies", "Higher studies"),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="students")
    uid = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    academic_year = models.CharField(max_length=30)
    academic_performance = models.FloatField(default=0)
    academic_attendance = models.FloatField(default=0)
    training_performance = models.FloatField(default=0)
    training_attendance = models.FloatField(default=0)
    current_category = models.TextField(choices=category_Type)
    is_student_coordinator = models.BooleanField(default=False)
    consent = models.TextField(choices=consent_Type)

    def __str__(self) -> str:
        return f"{self.user.email}"
