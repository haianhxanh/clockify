# Generated by Django 4.1.3 on 2022-11-21 09:58

from django.db import migrations, models
import django.db.models.deletion

def create_currencies(apps, schema_editor):
    Currency = apps.get_model("workspace", "Currency")
    currencies = [
        "USD", "EUR", "CZK"
    ]
    for currency in currencies:
        Currency.objects.create(shortcut_name=currency)

class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0002_alter_project_currency'),
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',

            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shortcut_name', models.CharField(max_length=3)),
            ],
        ),
        migrations.AddField(
            model_name='project',
            name='hourly_rate',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='permission',
            name='name',
            field=models.CharField(choices=[('add_project', 'add_project'), ('edit_prject', 'edit_project'), ('delete_project', 'delete_project'), ('add_task', 'add_task'), ('edit_task', 'edit_task'), ('delete_task', 'delete_task'), ('add_time_record', 'add_time_record'), ('edit_time_record', 'edit_time_record'), ('delete_time_record', 'delete_time_record'), ('view', 'view'), ('generate_report', 'generate_report')], max_length=20),
        ),
        migrations.AlterField(
            model_name='role',
            name='name',
            field=models.CharField(choices=[('', ''), ('admin', 'admin'), ('collaborator', 'collaborator'), ('visitor', 'visitor')], default='', max_length=20),
        ),
        migrations.CreateModel(
            name='UserTasks',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workspace.task')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workspace.user')),
            ],
        ),
        migrations.CreateModel(
            name='UserProjects',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workspace.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='workspace.user')),
            ],
        ),
        migrations.AlterField(
            model_name='project',
            name='currency',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='workspace.currency'),
        ),
        migrations.RunPython(
            create_currencies,
        )
    ]
