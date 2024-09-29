from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()
# Create your models here.

class DepartmentCoordinator(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    officer_id = models.CharField(max_length=100)
    department = models.CharField(max_length=100)