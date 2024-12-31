from django.db import models
from base.models import User
from uuid import uuid4

# Create your models here.


class Student(models.Model):
    category_Type = [
        ("Category 1", "category 1"),
        ("Category 2", "category 2"),
        ("Category 3", "category 3"),
        ("No category", "No category"),
    ]
    consent_Type = [
        ("placement", "placement"),
        ("Higher studies", "Higher studies"),
    ]
    CARD_TYPE = [
        ("Yellow", "Yellow"),
        ("Orange", "Orange"),
        ("Red", "Red"),
    ]
    user = models.OneToOneField(
        User, on_delete=models.SET_NULL, related_name="students", null=True
    )
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    uid = models.CharField(max_length=100, unique=True)
    department = models.CharField(max_length=100)
    academic_year = models.CharField(max_length=30)
    current_category = models.TextField(choices=category_Type, default="No category")
    is_dse_student = models.BooleanField(default=False)
    gender = models.CharField(max_length=10, default="MALE")
    dob = models.CharField(null=True, blank=True, default="Not Provided", max_length=20)
    contact = models.CharField(max_length=15, default="Not Provided")
    personal_email = models.EmailField(blank=True, null=True)
    is_student_coordinator = models.BooleanField(default=False)
    tenth_grade = models.FloatField(default=0.0)
    higher_secondary_grade = models.FloatField(default=0.0)
    card = models.CharField(max_length=40, choices=CARD_TYPE, default="Green")
    consent = models.CharField(choices=consent_Type, default="placement", max_length=30)
    batch = models.CharField(max_length=100, default="2021")
    cgpa = models.FloatField(null=True)
    attendance = models.FloatField(null=True)
    is_kt = models.BooleanField(default=False)
    is_backLog = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"{self.uid}"


SEM_OPTIONS = [
    ("Semester 1", "Semester 1"),
    ("Semester 2", "Semester 2"),
    ("Semester 3", "Semester 3"),
    ("Semester 4", "Semester 4"),
    ("Semester 5", "Semester 5"),
    ("Semester 6", "Semester 6"),
    ("Semester 7", "Semester 8"),
    ("Semester 8", "Semester 8"),
]


class AcademicPerformanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="academic_performance"
    )
    performance = models.FloatField(default=0)
    semester = models.CharField(max_length=30, choices=SEM_OPTIONS)

    class Meta:
        unique_together = ["student", "semester"]


class AcademicAttendanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="academic_attendance"
    )
    attendance = models.FloatField(default=0)
    semester = models.CharField(max_length=30, choices=SEM_OPTIONS)

    class Meta:
        unique_together = ["student", "semester"]


class TrainingPerformanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="training_performance"
    )
    training_performance = models.FloatField(default=0)
    semester = models.CharField(max_length=30, choices=SEM_OPTIONS)
    program = models.CharField(max_length=100, default="ACT_TECHNICAL")

    class Meta:
        unique_together = ["student", "semester"]


class TrainingAttendanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="training_attendance"
    )
    training_attendance = models.FloatField(default=0)
    semester = models.CharField(max_length=30, choices=SEM_OPTIONS)
    program = models.CharField(max_length=100, default="ACT_TECHNICAL")

    class Meta:
        unique_together = ["student", "semester"]


class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="resume"
    )
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)


class Resume_Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="contact")
    url = models.URLField()


class Resume_Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="skill")
    skill = models.CharField(max_length=100)


class Resume_WorkExperience(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="work")
    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    start_date = models.TextField()
    end_date = models.TextField()
    description = models.TextField(null=True)


class Resume_Education(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="education"
    )
    institution = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)
    start_date = models.TextField()
    end_date = models.TextField()
    percentage = models.TextField()


class Resume_Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="project")
    title = models.CharField(max_length=100)
    description = models.TextField(null=True)
