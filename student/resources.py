from django.contrib.auth.hashers import make_password
from django.db import transaction
from import_export import resources
from .models import Student, User
from uuid import uuid4


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
            "current_category",
            "is_dse_student",
            "gender",
            "dob",
            "contact",
            "personal_email",
            "tenth_grade",
            "higher_secondary_grade",
            "card",
            "consent",
        )
        import_id_fields = ("uid",)

    def import_row(self, row, instance_loader, **kwargs):
        # Get or create the User instance linked to the Student
        try:
            user = User.objects.get(email=row["email"])
        except User.DoesNotExist:
            user = User.objects.create(
                id=uuid4(),
                email=row["email"],
                full_name=row.get("full_name", ""),
                password=make_password(row.get("password")),
                role="student",
            )
        row["user"] = user.id

        # Validate and set fields with default values if not provided
        row["current_category"] = row.get("current_category", "No category")
        row["is_dse_student"] = row.get("is_dse_student", False)
        row["gender"] = row.get("gender", "Not Provided")
        row["contact"] = row.get("contact", "Not Provided")
        row["card"] = row.get("card", "Green")
        row["consent"] = row.get("consent", "placement")

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
