# Generated by Django 5.1.1 on 2025-01-01 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('internship_api', '0003_remove_internshipacceptance_company_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='internshipacceptance',
            name='position',
        ),
        migrations.AddField(
            model_name='internshipacceptance',
            name='offer_type',
            field=models.CharField(default='in_house', max_length=100),
        ),
        migrations.AddField(
            model_name='internshipacceptance',
            name='year',
            field=models.CharField(default='FE', max_length=100),
        ),
        migrations.AlterField(
            model_name='internshipacceptance',
            name='type',
            field=models.CharField(max_length=100),
        ),
    ]