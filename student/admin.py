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
        return obj.user.full_name if obj.user else ''
    def get_student_email(self, obj):
        return obj.user.email if obj.user else ''
    get_student_name.short_description = 'Name'
    get_student_email.short_description = 'Email'
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
    resource_class = StudentResource
