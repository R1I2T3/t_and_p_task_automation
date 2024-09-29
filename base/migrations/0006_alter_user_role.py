# Generated by Django 5.1.1 on 2024-09-26 14:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0005_alter_user_role'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.TextField(choices=[('student', 'student'), ('system_admin', 'system_admin'), ('principal', 'principal'), ('department_coordinator', 'department_coordinator')]),
        ),
    ]