from rest_framework import serializers
from .models import Notification
from base.models import User


class NotificationSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ["creator"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["creator"] = request.user
        recipients_data = validated_data.pop("recipients", [])
        notification = Notification.objects.create(**validated_data)
        notification.recipients.set(recipients_data)
        return notification
