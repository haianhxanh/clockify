# Generated by Django 4.1.4 on 2023-01-04 10:26

from django.db import migrations, models


def create_roles(apps, schema_editor):
    Role = apps.get_model("workspace", "Role")
    roles = ["admin", "member", "guest"]

    for role in roles:
        Role.objects.create(name=role)


def delete_roles(apps, schema_editor):
    Role = apps.get_model("workspace", "Role")
    Role.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("workspace", "0010_alter_userproject_project_alter_userproject_role_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="role",
            name="permissions",
        ),
        migrations.AlterField(
            model_name="role",
            name="name",
            field=models.CharField(max_length=32, unique=True),
        ),
        migrations.DeleteModel(
            name="Permission",
        ),
        migrations.RunPython(create_roles, reverse_code=delete_roles),
    ]