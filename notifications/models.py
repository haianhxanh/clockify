# from workspace.models import User
from __future__ import annotations
from typing import Type, List

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.db import models

from notifications.enums import NotificationTypeChoices, NotificationSeverityChoices, NotificationActionChoices

User = settings.AUTH_USER_MODEL


class BaseModel(models.Model):
    created = models.DateTimeField(auto_now_add=True, null=True)
    updated = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True


# class NotificationActionChoices:
#     pass


class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    type = models.CharField(max_length=36, choices=NotificationTypeChoices)
    read = models.BooleanField(null=True)
    severity = models.IntegerField(choices=NotificationSeverityChoices.choices, default=0)
    action = models.CharField(max_length=36, choices=NotificationActionChoices, null=True)
    created_by = models.TextField(max_length=36, null=True)
    target_id = models.IntegerField(null=True)
    target_name = models.TextField(max_length=255, null=True)

    # @staticmethod
    # def create_notification(user_project_list, type, message, task_id):
    #     print('run')
    #     for user_project in user_project_list:
    #         Notification.objects.create(user=user_project.user, type=type, message=message, read=False, task_id=task_id)
    #         channel_layer = get_channel_layer()
    #         group = "notification"
    #         async_to_sync(channel_layer.group_send)(
    #             group,
    #             {
    #                 "type": type,
    #                 "message": message,
    #                 "user_id": user_project.user.id,
    #                 "read": False,
    #                 "user_email": user_project.user.email,
    #                 "task_id": task_id
    #             },
    #         )


def new_create_notification(model: Type[Notification], user: User, type, action, severity, created_by, target_id,
                            target_name, *args, **kwargs) -> None:
    notification = model.objects.create(user=user, type=type, action=action, read=False, severity=severity,
                                        created_by=created_by,
                                        target_id=target_id, target_name=target_name, **kwargs)
    channel_layer = get_channel_layer()
    group = "notification"
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "action": action,
            "type": type,
            "message": {
                "user_id": user.id,
                "read": False,
                "user_email": user.email,
                "created_by": created_by,
            }
        },
    )


def create_notifications(model: Type[Notification], users: List[User], type, action, severity, created_by, target_id,
                         target_name, *args, **kwargs):
    for user in users:
        new_create_notification(model, user, type, action, severity, created_by, target_id,
                                target_name, *args, **kwargs)


# def create_task_notifications(model: Type[TaskNotification], users: List[User], type, action, severity, created_by, *args, **kwargs):
#     for user in users:
#         new_create_notification(model, user, type, action, severity, created_by, *args, **kwargs)


class SystemNotification(Notification):
    pass


class TaskNotification(Notification):
    task_id = models.IntegerField(null=True)
    task_name = models.TextField(max_length=256, null=True)
