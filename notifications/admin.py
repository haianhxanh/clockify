from django.contrib import admin
from notifications.models import (Notification, TaskNotification)

# Register your models here.
myModels = [Notification, TaskNotification]
admin.site.register(myModels)