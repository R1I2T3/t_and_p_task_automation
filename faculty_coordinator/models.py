from django.db import models


class AttendanceRecord(models.Model):
    program_name = models.CharField(max_length=255)
    session = models.CharField(max_length=255)
    uid = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    year = models.IntegerField()
    batch = models.CharField(max_length=255)
    present = models.CharField(max_length=50)
    late = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now=True)
