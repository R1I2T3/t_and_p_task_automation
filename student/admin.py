from django.contrib.admin import register
from unfold.admin import ModelAdmin
from .models import Student
# Register your models here.


@register(Student)
class StudentAdmin(ModelAdmin):
    model = Student
    list_display = [
        "uid",
        "department",
        "academic_year",
        "academic_performance",
    ]
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "user",
                    "uid",
                    "department",
                    "academic_year",
                ),
            },
        ),
    )
