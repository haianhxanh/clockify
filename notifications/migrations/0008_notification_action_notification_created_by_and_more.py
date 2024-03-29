# Generated by Django 4.2b1 on 2023-10-24 01:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0007_systemnotification_remove_notification_task_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='action',
            field=models.CharField(choices=[('CREATED', 'CREATED'), ('DELETED', 'DELETED'), ('UPDATE', 'UPDATED')], max_length=36, null=True),
        ),
        migrations.AddField(
            model_name='notification',
            name='created_by',
            field=models.TextField(max_length=36, null=True),
        ),
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(choices=[('PROJECT', 'PROJECT'), ('TASK', 'TASK')], max_length=36),
        ),
    ]
