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
    Resume_ActivitiesAndAchievement
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



class AcademicPerformanceSemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPerformanceSemester
        fields = ["semester", "performance"]


class AcademicAttendanceSemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicAttendanceSemester
        fields = ["semester", "attendance"]


class TrainingPerformanceSemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingPerformanceSemester
        fields = ["semester", "training_performance", "program"]


class TrainingAttendanceSemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingAttendanceSemester
        fields = ["semester", "training_attendance", "program"]


class StudentSerializer(serializers.ModelSerializer):
    academic_performance = AcademicPerformanceSemesterSerializer(many=True, read_only=True)
    academic_attendance = AcademicAttendanceSemesterSerializer(many=True, read_only=True)
    training_performance = TrainingPerformanceSemesterSerializer(many=True, read_only=True)
    training_attendance = TrainingAttendanceSemesterSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Student
        fields = "__all__"

class SessionAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceData
        fields = '__all__'


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

class ActivitiesAndAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume_ActivitiesAndAchievement
        fields = ["id", "title", "description"]

class ResumeSerializer(serializers.ModelSerializer):
    contacts = serializers.ListField(
        child=serializers.URLField(), write_only=True
    )
    skills = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )
    education = ResumeEducationSerializer(many=True)
    activitiesAndAchievements = ActivitiesAndAchievementSerializer(
        many=True, source="activities_and_achievements"
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
            "profile_image",
            "contacts",
            "skills",
            "education",
            "projects",
            "workExperience",
            "activitiesAndAchievements",
        ]

    def create(self, validated_data):
        contacts = validated_data.pop("contacts", [])
        skills = validated_data.pop("skills", [])
        education_data = validated_data.pop("education", [])
        projects_data = validated_data.pop("project", [])
        work_experience_data = validated_data.pop("work", [])
        achievements_data = validated_data.pop("activities_and_achievements", [])

        resume = Resume.objects.create(**validated_data)

        # Create related objects
        Resume_Contact.objects.bulk_create([
            Resume_Contact(resume=resume, url=url) for url in contacts
        ])
        Resume_Skill.objects.bulk_create([
            Resume_Skill(resume=resume, skill=s) for s in skills
        ])
        Resume_Education.objects.bulk_create([
            Resume_Education(resume=resume, **e) for e in education_data
        ])
        Resume_Project.objects.bulk_create([
            Resume_Project(resume=resume, **p) for p in projects_data
        ])
        Resume_WorkExperience.objects.bulk_create([
            Resume_WorkExperience(resume=resume, **w) for w in work_experience_data
        ])
        Resume_ActivitiesAndAchievement.objects.bulk_create([
            Resume_ActivitiesAndAchievement(resume=resume, **a) for a in achievements_data
        ])

        return resume

    def update(self, instance, validated_data):
        contacts = validated_data.pop("contacts", [])
        skills = validated_data.pop("skills", [])
        education_data = validated_data.pop("education", [])
        projects_data = validated_data.pop("project", [])
        work_experience_data = validated_data.pop("work", [])
        achievements_data = validated_data.pop("activities_and_achievements", [])

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace related data
        instance.contact.all().delete()
        instance.skill.all().delete()
        instance.education.all().delete()
        instance.project.all().delete()
        instance.work.all().delete()
        instance.activities_and_achievements.all().delete()

        Resume_Contact.objects.bulk_create([
            Resume_Contact(resume=instance, url=url) for url in contacts
        ])
        Resume_Skill.objects.bulk_create([
            Resume_Skill(resume=instance, skill=s) for s in skills
        ])
        Resume_Education.objects.bulk_create([
            Resume_Education(resume=instance, **e) for e in education_data
        ])
        Resume_Project.objects.bulk_create([
            Resume_Project(resume=instance, **p) for p in projects_data
        ])
        Resume_WorkExperience.objects.bulk_create([
            Resume_WorkExperience(resume=instance, **w) for w in work_experience_data
        ])
        Resume_ActivitiesAndAchievement.objects.bulk_create([
            Resume_ActivitiesAndAchievement(resume=instance, **a) for a in achievements_data
        ])

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["contacts"] = [c.url for c in instance.contact.all()]
        representation["skills"] = [s.skill for s in instance.skill.all()]
        return representation
