# Generated by Django 5.1.1 on 2024-09-29 06:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0005_remove_academicperformancesemester_academic_attendance_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='uid',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
