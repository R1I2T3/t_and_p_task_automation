# Generated by Django 5.1.1 on 2024-09-29 06:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0004_remove_student_academic_attendance_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='academicperformancesemester',
            name='academic_attendance',
        ),
        migrations.RemoveField(
            model_name='trainingperformancesemester',
            name='training_attendance',
        ),
        migrations.AlterField(
            model_name='academicperformancesemester',
            name='semester',
            field=models.CharField(choices=[('Semester 1', 'Semester 1'), ('Semester 2', 'Semester 2'), ('Semester 3', 'Semester 3'), ('Semester 4', 'Semester 4'), ('Semester 5', 'Semester 5'), ('Semester 6', 'Semester 6'), ('Semester 7', 'Semester 8'), ('Semester 7', 'Semester 8')], max_length=30),
        ),
        migrations.AlterField(
            model_name='trainingperformancesemester',
            name='semester',
            field=models.CharField(choices=[('Semester 1', 'Semester 1'), ('Semester 2', 'Semester 2'), ('Semester 3', 'Semester 3'), ('Semester 4', 'Semester 4'), ('Semester 5', 'Semester 5'), ('Semester 6', 'Semester 6'), ('Semester 7', 'Semester 8'), ('Semester 7', 'Semester 8')], max_length=30),
        ),
        migrations.CreateModel(
            name='AcademicAttendanceSemester',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('academic_performance', models.FloatField(default=0)),
                ('semester', models.CharField(choices=[('Semester 1', 'Semester 1'), ('Semester 2', 'Semester 2'), ('Semester 3', 'Semester 3'), ('Semester 4', 'Semester 4'), ('Semester 5', 'Semester 5'), ('Semester 6', 'Semester 6'), ('Semester 7', 'Semester 8'), ('Semester 7', 'Semester 8')], max_length=30)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='academic_attendance', to='student.student')),
            ],
        ),
        migrations.CreateModel(
            name='TrainingAttendanceSemester',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('training_attendance', models.FloatField(default=0)),
                ('semester', models.CharField(choices=[('Semester 1', 'Semester 1'), ('Semester 2', 'Semester 2'), ('Semester 3', 'Semester 3'), ('Semester 4', 'Semester 4'), ('Semester 5', 'Semester 5'), ('Semester 6', 'Semester 6'), ('Semester 7', 'Semester 8'), ('Semester 7', 'Semester 8')], max_length=30)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='training_attendance', to='student.student')),
            ],
        ),
    ]