from import_export import resources
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Student
from django.db import transaction

User = get_user_model()


class StudentResource(resources.ModelResource):
    class Meta:
        model = Student
        fields = (
            "email",
            "full_name",
            "role",
            "password",
            "uid",
            "department",
            "academic_year",
            "user",
        )
        import_id_fields = ("uid",)

    def import_row(self, row, instance_loader, **kwargs):
        user = User.objects.filter(email=row["email"]).first()
        if not user:
            user, user_created = User.objects.update_or_create(
                email=row["email"],
                defaults={
                    "email": row["email"],
                    "full_name": row.get("full_name", ""),
                    "password": make_password(row.get("password")),
                    "role":"student"
                },
            )
        row["user"] = user.id
        return super().import_row(row, instance_loader, **kwargs)

    def get_or_init_instance(self, instance_loader, row):
        instance, created = super().get_or_init_instance(instance_loader, row)
        if not created:
            user = User.objects.get(email=row["email"])
            instance.user = user
        return instance, created

    @transaction.atomic
    def import_data(
        self,
        dataset,
        dry_run=False,
        raise_errors=False,
        use_transactions=None,
        collect_failed_rows=False,
        **kwargs,
    ):
        return super().import_data(
            dataset,
            dry_run,
            raise_errors,
            use_transactions,
            collect_failed_rows,
            **kwargs,
        )