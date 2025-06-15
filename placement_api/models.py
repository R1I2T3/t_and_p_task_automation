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
    is_pli = models.BooleanField(default=False)
    is_ojt_aedp = models.BooleanField(default=False)
    batch = models.CharField(max_length=100, default="2021")

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
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    srNo = models.TextField(default="")
    to = models.TextField(default="")
    subject = models.TextField(default="")
    date = models.TextField(default="")
    intro = models.TextField(default="")
    eligibility_criteria = models.TextField(default="")
    roles = models.TextField(default="")
    about = models.TextField(default="")
    skill_required = models.TextField(default="")
    Location = models.TextField(default="")
    Documents_to_Carry = models.TextField(default="")
    Walk_in_interview = models.TextField(default="")
    Company_registration_Link = models.TextField(default="")
    Note = models.TextField(default="")
    From = models.TextField(default="")
    From_designation = models.TextField(default="")
    company = models.OneToOneField(
        to=CompanyRegistration,
        on_delete=models.CASCADE,
        related_name="placement_notice",
    )
    offers = models.ManyToManyField(
        to=Offers,
        related_name="notices",
        blank=True,  # Allow creating notices without offers initially
    )


class jobApplication(models.Model):
    id = models.UUIDField(primary_key=True)
    student = models.ForeignKey(to=Student, on_delete=models.DO_NOTHING)
    company = models.ForeignKey(
        to=CompanyRegistration,
        on_delete=models.DO_NOTHING,
        related_name="company_job_applications",
    )
    offer = models.ForeignKey(
        to=Offers,
        on_delete=models.DO_NOTHING,
        related_name="job_applications",
        null=True,
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
    company = models.ForeignKey(
        to=CompanyRegistration, on_delete=models.DO_NOTHING, null=True
    )
    offer_letter = models.FileField()
    type = models.CharField(max_length=100, default="")
    salary = models.FloatField(default=0)
    salary_category = models.CharField(max_length=100, default="")
    position = models.CharField(max_length=100, default="")
    isVerified = models.BooleanField(default=False)
    is_sel = models.BooleanField(default=False)  # selected
    is_reg = models.BooleanField(default=False)  # registered

