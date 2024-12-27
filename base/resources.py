from django.db import transaction
from import_export import resources
from .models import FacultyResponsibility, User
from django.contrib.auth.hashers import make_password


class FacultyResponsibilityResource(resources.ModelResource):
    class Meta:
        model = FacultyResponsibility
        fields = (
            "user",
            "program",
            "department",
        )
        import_id_fields = ("program", "department")

    def import_row(self, row, instance_loader, **kwargs):
        # Ensure the User instance exists and link it to FacultyResponsibility
        user = User.objects.filter(email=row["email"]).first()
        if not user:
            user, user_created = User.objects.update_or_create(
                email=row["email"],
                defaults={
                    "email": row["email"],
                    "full_name": row.get("full_name", ""),
                    "password": make_password(row.get("password")),
                    "role": "faculty",
                },
            )
        row["user"] = user.id

        # Set defaults for program and department if not provided
        row["program"] = row.get("program", None)
        row["department"] = row.get("department", None)

        return super().import_row(row, instance_loader, **kwargs)

    def get_or_init_instance(self, instance_loader, row):
        # Ensure `user` field links correctly to an existing User
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
