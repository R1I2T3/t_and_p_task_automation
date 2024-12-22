from rest_framework import serializers
from .models import Notification
from base.models import User
from student.models import Student


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
