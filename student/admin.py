from django.contrib.admin import register
from unfold.admin import ModelAdmin
from .models import Student
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import (
    ExportForm,
    ImportForm,
)
from .resources import StudentResource

# Register your models here.


@register(Student)
class StudentAdmin(ImportExportModelAdmin, ModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm

    list_display = [
        "uid",
        "department",
        "get_student_name",
        "get_student_email",
    ]

    def get_student_name(self, obj):
        return obj.user.full_name if obj.user else ""

    def get_student_email(self, obj):
        return obj.user.email if obj.user else ""

    get_student_name.short_description = "Name"
    get_student_email.short_description = "Email"
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "uid",
                    "department",
                    "academic_year",
                    "user",
                    "current_category",
                    "is_dse_student",
                    "gender",
                    "dob",
                    "contact",
                    "personal_email",
                    "is_student_coordinator",
                    "tenth_grade",
                    "higher_secondary_grade",
                    "card",
                    "consent",
                ),
            },
        ),
    )
    resource_class = StudentResource
