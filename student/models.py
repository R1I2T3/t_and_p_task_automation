from django.db import models
from base.models import User
from program_coordinator.models import ProgramCoordinator
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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="students")
    uid = models.CharField(max_length=100,unique=True)
    department = models.CharField(max_length=100)
    academic_year = models.CharField(max_length=30)
    current_category = models.TextField(choices=category_Type, default="No category")
    is_student_coordinator = models.BooleanField(default=False)
    consent = models.CharField(choices=consent_Type, default="placement",max_length=30)   
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
        unique_together = ['student', 'semester']

class AcademicAttendanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="academic_attendance"
    )
    attendance = models.FloatField(default=0)
    semester = models.CharField(max_length=30,choices=SEM_OPTIONS)
    class Meta:
        unique_together = ['student', 'semester']

class TrainingPerformanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="training_performance"
    )
    training_performance = models.FloatField(default=0)
    semester = models.CharField(max_length=30,choices=SEM_OPTIONS)
    program = models.ForeignKey(ProgramCoordinator, on_delete=models.CASCADE,null=True)
    class Meta:
        unique_together = ['student', 'semester']
class TrainingAttendanceSemester(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="training_attendance"
    )
    training_attendance = models.FloatField(default=0)
    semester = models.CharField(max_length=30,choices=SEM_OPTIONS)
    program = models.ForeignKey(ProgramCoordinator, on_delete=models.CASCADE,null=True)
    class Meta:
        unique_together = ['student', 'semester']