from django.db import models
from base.models import User


class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_notifications"
    )
    recipients = models.ManyToManyField(User, related_name="received_notifications")
    files = models.FileField(upload_to="notifications/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    type_notification = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.title 