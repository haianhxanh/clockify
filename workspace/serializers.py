import itertools
from datetime import date
from time import strftime

from django.contrib.auth.hashers import make_password
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from workspace.enums import ProjectStatusChoices, ProjectStatusEnum
from workspace.models import Currency, Project, Task, User, TimeRecord, UserProject, UserTask, Role


class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta:
        model = User
        fields = tuple(User.REQUIRED_FIELDS) + (
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
        )


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["shortcut_name"]


class ListUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):

    def validate_password(self, value: str) -> str:
        return make_password(value)

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class TaskSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "name", "status"]


class UserTaskSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    user_id = serializers.ReadOnlyField(source="user.id")

    class Meta:
        model = UserTask
        fields = ["id", "username", "user_id"]


class AddUserTaskSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    username = serializers.ReadOnlyField(source="user.username")

    def save(self, **kwargs):
        task_id = self.context["task_id"]
        user_id = self.validated_data["user_id"]

        try:
            task_user = UserTask.objects.get(task_id=task_id, user_id=user_id)
            task_user.save()
        except UserTask.DoesNotExist:
            self.instance = UserTask.objects.create(task_id=task_id, **self.validated_data)

        return self.instance

    class Meta:
        model = UserTask
        fields = ["user_id", "username"]


class TaskSerializer(serializers.ModelSerializer):
    task_users = UserTaskSerializer(many=True)

    def create(self, validated_data):
        project_id = self.context['request'].project.id
        task = Task(name=validated_data["name"], project_id=project_id)
        task.save()
        return task

    class Meta:
        model = Task
        fields = ["id", "name", "max_allocated_hours", "tracked_hours", "status", "task_users", "project_id",
                  "time_records"]


class TaskItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


class TaskProjectSimpleSerializer(serializers.ModelSerializer):
    task_project = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "task_project"]

    def get_task_project(self, Task):
        return Task.project.name


class ProjectTaskSerializer(serializers.ModelSerializer):
    # def create(self, validated_data):
    #     project_id = self.context['project_id']
    #     return Task.objects.create(project_id=project_id, **self.validated_data)

    class Meta:
        model = Task
        fields = ["id", "name", "description", "max_allocated_hours", "tracked_hours", "status", "due_date", "project"]


class ProjectTimeRecordSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    task = TaskProjectSimpleSerializer()
    project_id = serializers.ReadOnlyField(source="project.id")

    class Meta:
        model = TimeRecord
        fields = ["id", "description", "start_time", "end_time", "date", "task", "user", "project_id"]

    def get_user(self, TimeRecord):
        return TimeRecord.user.username

    def get_task(self, TimeRecord):
        return TimeRecord.task.name

    def get_project(self, TimeRecord):
        return TimeRecord.task.project.id


class TaskTimeRecordSerializer(WritableNestedModelSerializer, serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = TimeRecord
        fields = ["id", "description", "start_time", "end_time", "tracked_hours", "date", "user"]

    def get_user(self, TimeRecord):
        return TimeRecord.user.username


class TimeRecordSerializer(serializers.ModelSerializer):
    # user = serializers.SerializerMethodField()
    user = UserSerializer(required=False)
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())

    class Meta:
        model = TimeRecord
        fields = ["id", "description", "start_time", "end_time", "tracked_hours", "date", "task", "user", "project"]


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "name", "description", "max_allocated_hours", "tracked_hours", "status", "due_date", "project"]

    def save(self, user_id):
        self.model.save(user_id=user_id)


class UpdateTimeRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeRecord
        exclude = ("user",)


class TimeRecordStartSerializer(serializers.ModelSerializer):

    class Meta:
        model = TimeRecord
        fields = ["description", "task", "project"]

    def create(self, validated_data, user):
        start_time = strftime("%H:%M")
        date_now = date.today()

        time_record = TimeRecord.objects.create(**validated_data, start_time=start_time, date=date_now, user=user)
        return time_record


class TimeRecordsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeRecord
        fields = ["description", "task", "start_time", "end_time", "project"]


class UserProjectSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.username")
    role = serializers.ReadOnlyField(source="role.name")
    user_id = serializers.ReadOnlyField(source="user.id")

    class Meta:
        model = UserProject
        fields = ["id", "username", "user_id", "role"]


class AddUserProjectSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    role_id = serializers.IntegerField()

    def save(self, **kwargs):
        project_id = self.context["project_id"]
        user_id = self.validated_data["user_id"]
        role_id = self.validated_data["role_id"]

        try:
            user_project = UserProject.objects.get(project_id=project_id, user_id=user_id, role_id=role_id)
            user_project.save()
        except UserProject.DoesNotExist:
            self.instance = UserProject.objects.create(project_id=project_id, **self.validated_data)

        return self.instance

    class Meta:
        model = UserProject
        fields = ["user_id", "project_id", "role_id"]


class TaskSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "name"]


class ListProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name"]


class ProjectSerializer(serializers.ModelSerializer):
    project_users = UserProjectSerializer(many=True)

    class Meta:
        model = Project
        fields = ["id", "name", "total_allocated_hours", "tracked_hours", "project_users", "status", "description"]

    def get_project_users(self, project_obj):
        return project_obj.user.username


class UpdateProjectSerializer(serializers.ModelSerializer):

    def get_status_value(self, data):
        status_dict = dict(ProjectStatusChoices)
        key_list = list(status_dict.keys())
        val_list = list(status_dict.values())

        status_name = val_list.index('in progress')
        status_value = key_list[status_name]
        return status_value

    class Meta:
        model = Project
        fields = "__all__"


class CreateProjectSerializers(serializers.ModelSerializer):
    def create(self, validated_data):
        project = Project(
                name=validated_data["name"],
                description=validated_data["description"],
                hourly_rate=validated_data["hourly_rate"],
                status="CREATED"
                )
        project.save()
        user_id = self.context['request'].user.id
        role = Role.objects.get(name="admin")
        UserProject.objects.create(user_id=user_id, project_id=project.id, role_id=role.id)
        return project

    class Meta:
        model = Project
        fields = ["id", "name", "description", "hourly_rate", "currency"]


class ProjectDetailSerializer(serializers.ModelSerializer):
    tasks = TaskSimpleSerializer(many=True)
    project_users = UserProjectSerializer(many=True)
    currency = CurrencySerializer()

    class Meta:
        model = Project
        fields = ["id", "name", "description", "status", "due_date", "hourly_rate", "total_allocated_hours",
                  "tracked_hours",
                  "currency", "tasks", "project_users", "hex_color"]

    def get_currency(self, Project):
        return Project.currency.shortcut_name


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # def validate(self, attrs):
    #     data = super(CustomTokenObtainPairSerializer, self).validate(attrs)
    #     data.update({'user': self.user.username})
    #     data.update({'id': self.user.id})
    #     return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['username'] = user.username
        return token
