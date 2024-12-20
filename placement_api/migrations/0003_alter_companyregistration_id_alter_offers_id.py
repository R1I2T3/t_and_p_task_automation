# Generated by Django 5.1.1 on 2024-12-12 07:39

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('placement_api', '0002_jobacceptance_position_jobacceptance_salary_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='companyregistration',
            name='id',
            field=models.UUIDField(default=uuid.UUID('0e3ded3b-0cd0-4e9f-94e1-eef4a43281dc'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='offers',
            name='id',
            field=models.UUIDField(default=uuid.UUID('5d7f2e68-2d2a-4950-801e-1c6bcd9b0be8'), primary_key=True, serialize=False),
        ),
    ]
