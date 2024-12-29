# Generated by Django 5.1.1 on 2024-12-27 08:31

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('student', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='card',
            field=models.CharField(choices=[('Yellow', 'Yellow'), ('Orange', 'Orange'), ('Red', 'Red')], default='Green', max_length=40),
        ),
        migrations.AddField(
            model_name='student',
            name='contact',
            field=models.CharField(default='Not Provided', max_length=15),
        ),
        migrations.AddField(
            model_name='student',
            name='dob',
            field=models.CharField(blank=True, default='Not Provided', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='student',
            name='gender',
            field=models.CharField(default='MALE', max_length=10),
        ),
        migrations.AddField(
            model_name='student',
            name='higher_secondary_grade',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='student',
            name='is_dse_student',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='student',
            name='personal_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='student',
            name='tenth_grade',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='trainingattendancesemester',
            name='program',
            field=models.CharField(default='ACT_TECHNICAL', max_length=100),
        ),
        migrations.AddField(
            model_name='trainingperformancesemester',
            name='program',
            field=models.CharField(default='ACT_TECHNICAL', max_length=100),
        ),
        migrations.AlterField(
            model_name='student',
            name='batch',
            field=models.CharField(default='2021', max_length=100),
        ),
        migrations.AlterField(
            model_name='student',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='student',
            name='user',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to=settings.AUTH_USER_MODEL),
        ),
    ]