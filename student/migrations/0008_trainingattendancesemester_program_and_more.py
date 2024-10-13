# Generated by Django 5.1.1 on 2024-10-04 14:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('program_coordinator', '0001_initial'),
        ('student', '0007_rename_academic_performance_academicattendancesemester_attendance_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='trainingattendancesemester',
            name='program',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='program_coordinator.programcoordinator'),
        ),
        migrations.AddField(
            model_name='trainingperformancesemester',
            name='program',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='program_coordinator.programcoordinator'),
        ),
        migrations.AlterField(
            model_name='student',
            name='consent',
            field=models.CharField(choices=[('placement', 'placement'), ('Higher studies', 'Higher studies')], default='placement', max_length=30),
        ),
        migrations.AlterUniqueTogether(
            name='academicattendancesemester',
            unique_together={('student', 'semester')},
        ),
        migrations.AlterUniqueTogether(
            name='academicperformancesemester',
            unique_together={('student', 'semester')},
        ),
        migrations.AlterUniqueTogether(
            name='trainingattendancesemester',
            unique_together={('student', 'semester')},
        ),
        migrations.AlterUniqueTogether(
            name='trainingperformancesemester',
            unique_together={('student', 'semester')},
        ),
    ]