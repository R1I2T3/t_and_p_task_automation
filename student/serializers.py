from rest_framework import serializers
from .models import (
    Student,
    AcademicPerformanceSemester,
    AcademicAttendanceSemester,
    TrainingPerformanceSemester,
    TrainingAttendanceSemester,
    Resume,
    Resume_Contact,
    Resume_Education,
    Resume_Project,
    Resume_Skill,
    Resume_WorkExperience,
) 
from program_coordinator_api.models import AttendanceData
from base.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name"]  # Add more fields if necessary


class ProgramCoordinatorSerializer(serializers.ModelSerializer):
    class Meta:
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
            "is_pli",
        ]

class StudentConsentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['consent']

class StudentPliUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['is_pli']

class SessionAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceData
        fields = '__all__'

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
    #program = ProgramCoordinatorSerializer()  # Nested program serializer

    class Meta:
        model = TrainingPerformanceSemester
        fields = ["id", "student", "training_performance", "semester", "program"]


class TrainingAttendanceSemesterSerializer(serializers.ModelSerializer):
    student = StudentSerializer()  # Nested student serializer
    #program = ProgramCoordinatorSerializer()  # Nested program serializer

    class Meta:
        model = TrainingAttendanceSemester
        fields = ["id", "student", "training_attendance", "semester", "program"]


class ResumeEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume_Education
        fields = ["id", "institution", "degree", "start_date", "end_date", "percentage"]


class ResumeProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume_Project
        fields = ["id", "title", "description"]


class ResumeWorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume_WorkExperience
        fields = ["id", "company", "position", "start_date", "end_date", "description"]


class ResumeSerializer(serializers.ModelSerializer):
    contacts = serializers.ListField(
        child=serializers.URLField(), source="contact", write_only=True
    )
    skills = serializers.ListField(
        child=serializers.CharField(), source="skill", write_only=True
    )
    education = ResumeEducationSerializer(
        many=True,
    )
    projects = ResumeProjectSerializer(many=True, source="project")
    workExperience = ResumeWorkExperienceSerializer(many=True, source="work")
    phone_no = serializers.CharField(source="phone_number")

    class Meta:
        model = Resume
        fields = [
            "id",
            "name",
            "email",
            "phone_no",
            "contacts",
            "skills",
            "education",
            "projects",
            "workExperience",
        ]

    def create(self, validated_data):
        contacts = validated_data.pop("contact", [])
        skills = validated_data.pop("skill", [])
        education_data = validated_data.pop("education", [])
        projects_data = validated_data.pop("project", [])
        work_experience_data = validated_data.pop("work", [])

        resume = Resume.objects.create(**validated_data)

        for url in contacts:
            Resume_Contact.objects.create(resume=resume, url=url)
        for skill_name in skills:
            Resume_Skill.objects.create(resume=resume, skill=skill_name)

        for edu_data in education_data:
            Resume_Education.objects.create(resume=resume, **edu_data)

        for project_data in projects_data:
            Resume_Project.objects.create(resume=resume, **project_data)
        for work_data in work_experience_data:
            Resume_WorkExperience.objects.create(resume=resume, **work_data)

        return resume

    def update(self, instance, validated_data):
        contacts = validated_data.pop("contact", [])
        skills = validated_data.pop("skill", [])
        education_data = validated_data.pop("education", [])
        projects_data = validated_data.pop("project", [])
        work_experience_data = validated_data.pop("work", [])

        instance.name = validated_data.get("name", instance.name)
        instance.email = validated_data.get("email", instance.email)
        instance.phone_number = validated_data.get(
            "phone_number", instance.phone_number
        )
        instance.save()

        instance.contact.all().delete()
        for url in contacts:
            Resume_Contact.objects.create(resume=instance, url=url)
        instance.skill.all().delete()
        for skill_name in skills:
            Resume_Skill.objects.create(resume=instance, skill=skill_name)

        instance.education.all().delete()
        for edu_data in education_data:
            Resume_Education.objects.create(resume=instance, **edu_data)

        instance.project.all().delete()
        for project_data in projects_data:
            Resume_Project.objects.create(resume=instance, **project_data)

        instance.work.all().delete()
        for work_data in work_experience_data:
            Resume_WorkExperience.objects.create(resume=instance, **work_data)

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        representation["contacts"] = [contact.url for contact in instance.contact.all()]

        representation["skills"] = [skill.skill for skill in instance.skill.all()]

        return representation
