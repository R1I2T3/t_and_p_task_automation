from rest_framework import serializers
from student.serializers import(

StudentSerializer,
AcademicAttendanceSemesterSerializer,
AcademicPerformanceSemesterSerializer,
TrainingPerformanceSemesterSerializer,
TrainingAttendanceSemesterSerializer
)
from student.models import Student

class DepartmentStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    fe_count = serializers.IntegerField()
    se_count = serializers.IntegerField()
    te_count = serializers.IntegerField()
    be_count = serializers.IntegerField()
    department_students = StudentSerializer(many=True)

class DepartmentStudentSerializer(serializers.ModelSerializer):

    academic_performance = AcademicPerformanceSemesterSerializer(many=True, read_only=True)
    academic_attendance = AcademicAttendanceSemesterSerializer(many=True, read_only=True)
    training_performance = TrainingPerformanceSemesterSerializer(many=True, read_only=True)
    training_attendance = TrainingAttendanceSemesterSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "uid",
            "department",
            "academic_year",
            "current_category",
            "consent",
            "batch",
            "consent",
            "academic_performance",
            "academic_attendance",
            "training_performance",
            "training_attendance"
        ]