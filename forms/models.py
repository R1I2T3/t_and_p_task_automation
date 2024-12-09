from django.db import models


# Create your models here.
class Forms(models.Model):
    id = models.UUIDField(unique=True, primary_key=True, auto_created=True)
    purpose = models.TextField()
    last_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.purpose


class FormField(models.Model):
    id = models.UUIDField(unique=True, primary_key=True, auto_created=True)
    field_name = models.CharField(max_length=100)
    field_label = models.CharField(max_length=100)
    field_placeholder = models.TextField()
    field_type = models.TextField()
    form = models.ForeignKey(to=Forms, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.field_name} - {self.form.purpose}"


class Options(models.Model):
    id = models.UUIDField(unique=True, primary_key=True, auto_created=True)
    value = models.TextField()
    field = models.ForeignKey(to=FormField, on_delete=models.CASCADE)
