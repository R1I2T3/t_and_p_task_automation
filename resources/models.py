from django.db import models
from base.models import User
from student.models import Student

class Resource(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_resources"
    )
    recipients = models.ManyToManyField(User, related_name="received_resources")
    academic_year = models.JSONField()  # Stores multiple years as an array
    department = models.JSONField()  # Stores multiple departments as an array
    file = models.FileField(upload_to="resources/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
