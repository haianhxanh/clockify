# Generated by Django 4.1.5 on 2023-02-20 23:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0017_alter_project_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='max_allocated_hours',
            field=models.FloatField(blank=True, default=0.0, null=True),
        ),
    ]
