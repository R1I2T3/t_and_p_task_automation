from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .serializers import NotificationSerializer
from .models import Notification


class NotificationListCreate(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class NotificationDetail(generics.RetrieveAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
