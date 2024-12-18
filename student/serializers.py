from rest_framework import serializers
from .models import (
    Student,
    AcademicPerformanceSemester,
    AcademicAttendanceSemester,
    TrainingPerformanceSemester,
    TrainingAttendanceSemester,
)
from base.models import User
from program_coordinator.models import ProgramCoordinator


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email"]  # Add more fields if necessary


class ProgramCoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramCoordinator
        fields = [
            "id",
            "name",
        ]  # Replace 'name' with actual fields in the ProgramCoordinator model


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nested user serializer

    class Meta:
        model = Student
        fields = [
            "id",
            "user",
            "uid",
            "department",
            "academic_year",
            "current_category",
            "is_student_coordinator",
            "consent",
            "batch",
        ]


class AcademicPerformanceSemesterSerializer(serializers.ModelSerializer):
    student = StudentSerializer()  # Nested student serializer

    class Meta:
        model = AcademicPerformanceSemester
        fields = ["id", "student", "performance", "semester"]


class AcademicAttendanceSemesterSerializer(serializers.ModelSerializer):
    student = StudentSerializer()  # Nested student serializer

    class Meta:
        model = AcademicAttendanceSemester
        fields = ["id", "student", "attendance", "semester"]


class TrainingPerformanceSemesterSerializer(serializers.ModelSerializer):
    student = StudentSerializer()  # Nested student serializer
    program = ProgramCoordinatorSerializer()  # Nested program serializer

    class Meta:
        model = TrainingPerformanceSemester
        fields = ["id", "student", "training_performance", "semester", "program"]


class TrainingAttendanceSemesterSerializer(serializers.ModelSerializer):
    student = StudentSerializer()  # Nested student serializer
    program = ProgramCoordinatorSerializer()  # Nested program serializer

    class Meta:
        model = TrainingAttendanceSemester
        fields = ["id", "student", "training_attendance", "semester", "program"]
