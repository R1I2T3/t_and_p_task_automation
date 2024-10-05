from django.db import models
from base.models import User
# Create your models here.

class ProgramCoordinator(models.Model):
    PROGRAM_OPTIONS = [
        ("ACT_Technical", "ACT_Technical"),
        ("ACT_Aptitude", "ACT_Aptitude"),
        ("Coding_Contest", "Coding_Contest"),
        ("SDP", "SDP"),
    ]
    officer_id = models.CharField(max_length=10)
    program = models.CharField(max_length=50, choices=PROGRAM_OPTIONS)
    user = models.OneToOneField(User, on_delete=models.CASCADE)