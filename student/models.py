from django.db import models
from base.models import User
from uuid import uuid4
from staff.models import CompanyRegistration, JobOffer
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
        ("placement+aedp/pli", "placement+aedp/pli"),
        ("Higher studies", "Higher studies"),
        ("Entrepreneurship", "Entrepreneurship"),
    ]

    CARD_TYPE = [
        ("Green", "Green"),
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
    tenth_grade = models.FloatField(default=0.0)
    higher_secondary_grade = models.FloatField(default=0.0)
    card = models.CharField(max_length=40, choices=CARD_TYPE, default="Green")
    consent = models.CharField(choices=consent_Type, default="placement", max_length=30)
    batch = models.CharField(max_length=100, default="2021")
    cgpa = models.FloatField(null=True)
    attendance = models.FloatField(null=True)
    is_kt = models.BooleanField(default=False)
    is_blacklisted = models.BooleanField(default=False)
    joined_company = models.BooleanField(default=False)

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
    profile_image = models.ImageField(upload_to='profile_images/', null=True)


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

class Resume_ActivitiesAndAchievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="activities_and_achievements",null=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField()

class StudentOffer(models.Model):
    OFFER_STATUS_CHOICES = [
        ("offered", "Offered"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("joined", "Joined"),
    ]

    OFFER_TYPE_CHOICES = [
        ("PLACEMENT", "Placement"),
        ("AEDP_PLI", "AEDP/PLI"),
        ("AEDP_OJT", "AEDP/OJT"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="student_offers"
    )
    company = models.ForeignKey(
        CompanyRegistration,
        on_delete=models.CASCADE,
        related_name="company_offers"
    )

    job_offer = models.ForeignKey(
        JobOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_offers"
    )

    offer_type = models.CharField(
        max_length=20,
        choices=OFFER_TYPE_CHOICES,
        default="PLACEMENT"
    )

    status = models.CharField(
        max_length=20,
        choices=OFFER_STATUS_CHOICES,
        default="offered"
    )

    salary = models.FloatField()
    role = models.CharField(max_length=255)
    offer_date = models.DateField(auto_now_add=True)

    # Optional helper flags
    is_aedp_pli = models.BooleanField(default=False)
    is_aedp_ojt = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "company", "role")

    def __str__(self):
        return f"{self.student.uid} → {self.company.name} ({self.status})"

class StudentPlacementAppliedCompany(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="applied_companies"
    )
    company = models.ForeignKey(
        CompanyRegistration,
        on_delete=models.CASCADE,
        related_name="company"
    )
    job_offer = models.ForeignKey(
        JobOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="offer"
    )
    interested = models.BooleanField(default=False)
    not_interested_reason = models.TextField()

    application_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "company")

    def __str__(self):
        return f"{self.student.uid} applied to {self.company.name}"


class PlacementCompanyProgress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    application = models.OneToOneField(
        StudentPlacementAppliedCompany,on_delete=models.CASCADE, related_name="application")
    registered = models.BooleanField(default=True)
    aptitude_test = models.BooleanField(default=False)
    coding_test = models.BooleanField(default=False)
    technical_interview = models.BooleanField(default=False)
    hr_interview = models.BooleanField(default=False)
    gd = models.BooleanField(default=False)
    final_result = models.CharField(max_length=100, default="Pending")