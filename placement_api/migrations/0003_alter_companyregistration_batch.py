# Generated by Django 5.1.1 on 2024-12-29 11:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('placement_api', '0002_companyregistration_batch_companyregistration_is_pli_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='companyregistration',
            name='batch',
            field=models.CharField(default='2021', max_length=100),
        ),
    ]