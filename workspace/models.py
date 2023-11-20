from datetime import datetime, time

from django.contrib.auth.models import AbstractUser
from django.db import models

from api.example import send_task_notification
from notifications.enums import NotificationSeverityChoices
from notifications.models import TaskNotification, create_notifications
from workspace.enums import TaskStatusChoices, ProjectStatusChoices
from workspace.querysets import TimeRecordQuerySet

# Create your models here.
DECIMAL_PLACES = 2
HOUR_IN_SECONDS = 3600


class BaseModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Currency(models.Model):
    shortcut_name = models.CharField(max_length=3)

    def __str__(self):
        return self.shortcut_name


class Project(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True, blank=True, related_name="currency")
    hex_color = models.CharField(max_length=7, null=True, blank=True)  # predefined colors + color picker
    # change model to have default 0
    hourly_rate = models.FloatField(null=True)
    status = models.CharField(max_length=36, choices=ProjectStatusChoices)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

    def to_dict(self):
        hourly_rate = self.hourly_rate or 0
        return {
            "name": self.name,
            "bill": self.tracked_hours * hourly_rate,
            "budget": self.total_allocated_hours * hourly_rate,
            "status": self.status,
            "allocated_hours": self.total_allocated_hours,
            "tracked_hours": self.tracked_hours,
            "tasks": [task.to_dict() for task in self.tasks.all()],
            "rate": self.hourly_rate,
            "due_date": self.due_date
        }

    @property
    def tracked_hours(self):
        tasks = self.tasks.all()
        total = 0
        for task in tasks:
            total += task.tracked_hours
        return round(total, 2)

    @property
    def total_allocated_hours(self):
        tasks = self.tasks.all()
        total = 0
        for task in tasks:
            if task.max_allocated_hours is None:
                total = total + 0
            else:
                total = total + task.max_allocated_hours
        return round(total, 2)


class Task(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    max_allocated_hours = models.FloatField(null=True, blank=True, default=0.0)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    status = models.CharField(max_length=36, choices=TaskStatusChoices)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"[{self.id}] {self.project.name} - {self.name}"

    def save(self, user_id=None, *args, **kwargs):
        if self.pk and self.max_allocated_hours < 0:
            self.max_allocated_hours = 0
        super().save(*args, **kwargs)

        notification_msg = f"Task: {self.name}"
        users = UserProject.objects.filter(project=self.project.id).exclude(project__user__id=user_id).values_list("user", flat=True)
        # new_create_notification(TaskNotification, user=user_list, type="task_new", message=notification_msg, task_id=self.id, severity=NotificationSeverityChoices.INFO)

        # create_notifications(TaskNotification, users=users, type="task_new", message=notification_msg, severity=NotificationSeverityChoices.INFO.value, task_id=self.id,)
        # for item in user_list:
        #     Notification.objects.create(user=item.user, type="TASK", message=notification_msg)

    def to_dict(self):
        tracked_hours = self.tracked_hours
        hourly_rate = self.project.hourly_rate or 0
        allocated_hours = self.max_allocated_hours or 0
        # change model to have default 0
        return {
            "name": self.name,
            "bill": tracked_hours * hourly_rate,
            "tracked_hours": tracked_hours,
            "budget": allocated_hours * hourly_rate,
            "status": self.status,
            "allocated_hours": allocated_hours,
            "rate": self.project.hourly_rate,
            "due_date": self.due_date
        }

    @property
    def tracked_hours(self):
        total = 0
        trackings = self.time_records.filter(end_time__isnull=False)
        for tracking in trackings:
            total += tracking.tracked_hours
        return total


class TimeRecord(BaseModel):
    description = models.TextField(max_length=1024, null=True, blank=True)
    start_time = models.TimeField()  # auto add time when Object is created, make it editable
    end_time = models.TimeField(null=True, blank=True)
    date = models.DateField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name="time_records")
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="time_records")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name="project_record")

    objects = TimeRecordQuerySet.as_manager()

    def __str__(self):
        if self.task:
            return f"{self.task} - {self.start_time}"
        return f"{self.id} - {self.start_time}"

    def save(self, *args, **kwargs):
        # make sure updated end_time is not earlier than start_time
        if self.pk and self.end_time:
            if self.end_time < self.start_time:
                self.end_time = self.start_time

        if self.task is not None:
            self.project = self.task.project

        super().save(*args, **kwargs)
        # try:
        #     object_last_version = TimeRecord.objects.get(pk=self.pk)
        #     if object_last_version.end_time:
        #         if self.end_time < self.start_time:
        #             self.end_time = self.start_time
        #         super().save(*args, **kwargs)
        # except TimeRecord.DoesNotExist:
        #     super().save(*args, **kwargs)

    def change_start_time(self, start_time):
        self.start_time = start_time
        self.save()

    def get_end_time(self) -> time:
        return datetime.now().time().replace(microsecond=0)

    def set_end_time_midnight(self, commit=True):
        self.end_time = time(23, 59, 0)
        if commit:
            self.save()

    def stop_time(self):
        start_time = self.start_time.strftime("%H:%M")
        end_time = self.get_end_time()
        now = datetime.now()
        start_date = self.date  # datetime.date(2022, 12, 19)
        end_date = now.date()

        if end_date == start_date:  # if same date
            self.end_time = end_time
            self.date = end_date
            self.save()

        elif end_date > start_date:  # if after midnight
            self.set_end_time_midnight(commit=False)
            # self.date = end_date - timedelta(days=1)
            self.save()

            # todo autokill after 24 hours
            new_end_time = end_time
            new_end_date = end_date
            new_start_time = "00:00"
            TimeRecord.objects.create(
                start_time=new_start_time,
                end_time=new_end_time,
                date=new_end_date,
                user=self.user,
            )

    @property
    def tracked_hours(self):
        total = 0
        start = datetime.strptime(self.start_time.strftime('%H:%M:%S'), "%H:%M:%S")
        end = datetime.strptime(self.end_time.strftime('%H:%M:%S'), "%H:%M:%S")
        if end > start:
            delta = end - start
            total = total + int(delta.total_seconds())
        return round(total / HOUR_IN_SECONDS, DECIMAL_PLACES)


class Report(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


class User(BaseModel, AbstractUser):
    tasks = models.ManyToManyField(Task, through="UserTask")
    projects = models.ManyToManyField(Project, through="UserProject")

    def __str__(self):
        return self.email

    def get_currently_running_timer(self) -> TimeRecord:
        """If nothing found in queryset throws TimeRecord.DoesNotExist"""
        time_records = self.time_records.filter(end_time__isnull=True)

        if time_records.count() > 1:
            # throw error/ kill all but last
            # ordered_time_records = time_records.order_by("-id")
            # latest_record = ordered_time_records[0]
            # for record in ordered_time_records:
            #     pprint(record)
            #     start_date = record.date
            #     now = datetime.now()
            #     if start_date != now.date():
            #         record.stop_time()
            #     elif start_date == now.date():
            #         if record != latest_record:
            #             pass
            # return record
            last_record = time_records.latest("id")
            all_other_records = time_records.exclude(pk=last_record.pk)
            # self.stop_time(all_other_records)
            [time_record.stop_time for time_record in all_other_records]
            return last_record

        return time_records.get()


class Role(models.Model):
    name = models.CharField(max_length=32, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.name


class UserTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_tasks")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="task_users")

    def __str__(self):
        return f"{self.user} - {self.task.name}"

    def save(self, *args, **kwargs):
        if not self.id:
            # create notification
            send_task_notification(self.user.id)
            pass
        super().save(*args, **kwargs)


class UserProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_projects")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_users")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role")

    def __str__(self):
        return f"{self.user} - {self.project.name}"
