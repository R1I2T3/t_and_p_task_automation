from rest_framework import serializers
from .models import AttendanceData, BatchAttendance, AttendanceRecord


class AttendanceDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceData
        fields = "__all__"


class BatchAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchAttendance
        fields = "__all__"


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "program_name",
            "year",
            "num_sessions",
            "num_days",
            "dates",
            "file_headers",
            "student_data",
        ]
