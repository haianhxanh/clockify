# Generated by Django 4.1.4 on 2023-01-02 00:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("workspace", "0005_userproject_delete_userprojectrole"),
    ]

    operations = [
        migrations.AddField(
            model_name="userproject",
            name="role",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="userprojects",
                to="workspace.role",
            ),
        ),
    ]