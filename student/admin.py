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
    resource_class = StudentResource
