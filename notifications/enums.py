from enum import Enum

from django.db.models import IntegerChoices


class NotificationTypeEnum(Enum):
    PROJECT = "project"
    TASK = "task"


class NotificationActionEnum(Enum):
    CREATED = "created"
    DELETED = "deleted"
    UPDATE = "updated"


class NotificationSeverityChoices(IntegerChoices):
    HIGH = 3
    MEDIUM = 2
    LOW = 1
    INFO = 0


NotificationTypeChoices = [(type.name, type.value) for type in NotificationTypeEnum]
NotificationActionChoices = [(type.name, type.value) for type in NotificationActionEnum]
