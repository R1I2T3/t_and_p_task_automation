from django.db import models
from student.models import Student
from uuid import uuid4

# Create your models here.


class CompanyRegistration(models.Model):
    DOMAIN_TYPES = [("core", "core"), ("it", "it")]
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=100)
    min_tenth_marks = models.FloatField(null=True)
    min_higher_secondary_marks = models.FloatField(null=True)
    min_cgpa = models.FloatField()
    min_attendance = models.FloatField()
    is_kt = models.BooleanField(default=False)
    is_backLog = models.BooleanField(default=False)
    domain = models.CharField(choices=DOMAIN_TYPES, max_length=40)
    Departments = models.TextField(default="all")
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.name}-{self.id}"


class Offers(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    type = models.CharField(max_length=100)
    salary = models.FloatField()
    position = models.CharField(max_length=100)
    company = models.ForeignKey(
        to=CompanyRegistration, on_delete=models.CASCADE, related_name="company_offers"
    )


class placementNotice(models.Model):
    id = models.UUIDField(primary_key=True)
    sr_no = models.TextField()
    to = models.TextField()
    subject = models.TextField()
    date = models.DateTimeField(auto_now=True)
    eligibility_criteria = models.TextField()
    roles = models.TextField()
    about = models.TextField(null=True)
    skill_required = models.TextField()
    company_registration_link = models.URLField()
    note = models.TextField()
    from_user = models.TextField()
    from_designation = models.TextField()
    extra = models.TextField()
    company = models.OneToOneField(
        to=CompanyRegistration,
        on_delete=models.CASCADE,
        related_name="placement_notice",
    )


class jobApplication(models.Model):
    id = models.UUIDField(primary_key=True)
    student = models.ForeignKey(to=Student, on_delete=models.DO_NOTHING)
    company = models.ForeignKey(
        to=Student, on_delete=models.DO_NOTHING, related_name="company_job_applications"
    )
    attendance = models.BooleanField(default=False)
    aptitude = models.BooleanField(null=True)
    gd = models.BooleanField(null=True)
    case_study = models.BooleanField(null=True)
    hr_round = models.BooleanField(null=True)


class jobAcceptance(models.Model):
    id = models.UUIDField(primary_key=True)
    student = models.ForeignKey(
        to=Student,
        on_delete=models.DO_NOTHING,
        related_name="company_job_offer_acceptance",
    )
    company = models.ForeignKey(to=CompanyRegistration, on_delete=models.DO_NOTHING)
    offer_letter = models.URLField()
    type = models.CharField(max_length=100, default="")
    salary = models.FloatField(default=0)
    position = models.CharField(max_length=100, default="")
    isVerified = models.BooleanField(default=False)
