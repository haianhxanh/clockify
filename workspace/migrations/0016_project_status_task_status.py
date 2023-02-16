# Generated by Django 4.1.5 on 2023-02-16 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0015_user_projects_user_tasks'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='status',
            field=models.CharField(choices=[('DONE', 'done'), ('IN_PROGRESS', 'in progress'), ('ARCHIVED', 'archived')], default='in progress', max_length=36),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='task',
            name='status',
            field=models.CharField(choices=[('DONE', 'done'), ('IN_PROGRESS', 'in progress'), ('CANCELLED', 'cancelled'), ('TO_DO', 'to do')], default='in progress', max_length=36),
            preserve_default=False,
        ),
    ]