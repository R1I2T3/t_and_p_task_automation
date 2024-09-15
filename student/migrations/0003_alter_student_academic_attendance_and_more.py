# Generated by Django 5.1.1 on 2024-09-11 10:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0002_student_delete_students'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='academic_attendance',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='student',
            name='academic_performance',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='student',
            name='training_attendance',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='student',
            name='training_performance',
            field=models.FloatField(default=0),
        ),
    ]