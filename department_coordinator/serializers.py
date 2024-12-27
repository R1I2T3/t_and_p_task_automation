from rest_framework import serializers
from student.serializers import StudentSerializer


class DepartmentStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    fe_count = serializers.IntegerField()
    se_count = serializers.IntegerField()
    te_count = serializers.IntegerField()
    be_count = serializers.IntegerField()
    department_students = StudentSerializer(many=True)
