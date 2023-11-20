from datetime import date
from time import strftime

from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Q
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.generic import TemplateView
from django.views.generic.edit import CreateView, UpdateView
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
# from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.core.exceptions import PermissionDenied
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template
from django.views import View
from rest_framework_simplejwt.views import TokenObtainPairView
from xhtml2pdf import pisa

from notifications.enums import NotificationSeverityChoices, NotificationTypeEnum, NotificationActionEnum
from notifications.models import create_notifications, TaskNotification, Notification
from workspace.serializers import (
    AddUserProjectSerializer,
    CreateProjectSerializers,
    ListUserSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    TaskSerializer,
    TimeRecordSerializer,
    TimeRecordStartSerializer,
    UpdateProjectSerializer,
    UserProjectSerializer,
    UserSerializer, ProjectTaskSerializer, ListProjectsSerializer, UserTaskSerializer,
    AddUserTaskSerializer, ProjectTimeRecordSerializer, TaskTimeRecordSerializer, UpdateTimeRecordSerializer,
    FilterSerializer, CustomTokenObtainPairSerializer,
)
from .enums import RoleEnum
from .filters import ProjectFilter, TrackingFilter, TaskFilter
from .forms import RegistrationForm
from .models import Project, Task, TimeRecord, User, UserProject, UserTask
from .permissions import isProjectAdmin, IsProjectMember, IsGuest, isProjectAdminOrMember, isAuthenticated, \
    isTaskProjectAdminOrMember


# from workspace.permissions import isProjectAdmin


def home(request):
    return render(request, "workspace/home.html")


class SSORedirectView(View):
    def get(self, request, **kwargs):
        # ...
        return redirect("frontend url", data={"token": "token"})


class RegistrationView(CreateView):
    template_name = "workspace/register.html"
    form_class = RegistrationForm

    # permission_classes = [isProjectAdmin]

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["next"] = self.request.GET.get("next")
        return context

    def get_success_url(self):
        next_url = self.request.POST.get("next")
        success_url = reverse("login")
        if next_url:
            success_url += "?next={}".format(next_url)

        return success_url


class ProfileView(UpdateView):
    model = User
    fields = ["name", "phone", "date_of_birth", "picture"]
    template_name = "workspace/profile.html"

    def get_success_url(self):
        return reverse("index")

    def get_object(self):
        return self.request.user


class Register(APIView):
    def post(self, request):
        form = UserCreationForm(request.POST)
        form.is_valid()
        form.save()
        username = form.cleaned_data.get("username")
        messages.success(request, f"Hi {username}, your account was successfully created")
        return redirect("home")


class TrackingStart(APIView):
    permission_classes = [IsAuthenticated]

    # kill all running
    def find_and_kill_all_running(self, user):
        running_timers = TimeRecord.objects.filter_running_timers(user)
        for timer in running_timers:
            timer.stop_time()

    # start new
    def post(self, request):
        serializer = TimeRecordStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        time_record = serializer.create(serializer.validated_data, user=request.user)
        # record_data = {
        #     "start_time": strftime("%H:%M"), # start_time=strftime()
        #     "date": date.today(),
        #     "user": request.user
        # }
        # # start_time = strftime("%H:%M")
        # # date_now = date.today()
        # self.find_and_kill_all_running(request.user)
        #
        # # QA: how to rewrite this and make request.data optional
        # # if 'description' in request.data:
        # #     time_record = serializer.save(start_time=start_time, date=date_now, user=request.user,
        # #                                   description=request.data['description'])
        # # else:
        # #     time_record = serializer.save(start_time=start_time, date=date_now, user=request.user)
        #
        # if "description" in request.data:
        #     record_data["description"] = request.data["description"]
        #
        # time_record = serializer.save(**record_data)

        # print(serializer.validated_data)
        # time_record = serializer.save(**{'start_time': start_time, "date": date_now, "user":request.user})
        response_serializer = TimeRecordSerializer(time_record)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class StopAll(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        queryset = TimeRecord.objects.filter_running_timers(user=request.user)
        for tracker in queryset:
            tracker.stop_time()

        serializer = TimeRecordSerializer(queryset, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


# stop currently running one
class TrackingStop(APIView):
    permission_classes = [IsAuthenticated]

    # def update(self, request, *args, **kwargs):
    #     partial = kwargs.pop('partial', False)
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=partial)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     return Response(serializer.data)


    def post(self, request):
        user: User = request.user
        try:
            current_timer = user.get_currently_running_timer()
        except TimeRecord.DoesNotExist:
            Response({}, status=status.HTTP_404_NOT_FOUND)

        current_timer.stop_time()
        serializer = TimeRecordSerializer(current_timer)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListAllUsers(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ListUserSerializer

    def get_queryset(self, request):
        return User.objects.get(id=request.user.id)


class UserViewSet(ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all()


class ListUserProject(ListAPIView):
    pass


class UserProjectViewSet(ModelViewSet):

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            self.permission_classes = [IsProjectMember]
        else:
            self.permission_classes = [isProjectAdmin]
        return [isProjectAdminOrMember()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AddUserProjectSerializer
        return UserProjectSerializer

    def get_serializer_context(self):
        return {"project_id": self.kwargs["project_pk"]}

    def get_queryset(self):
        return UserProject.objects.filter(project_id=self.kwargs["project_pk"]).select_related("project")


class TimeRecordViewSet(ModelViewSet):
    serializer_class = TimeRecordSerializer
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_queryset(self):
        return TimeRecord.objects.filter(user=self.request.user).order_by("-updated")

    def filter_queryset(self, queryset):
        filtered = TrackingFilter(self.request.GET, queryset=queryset).qs
        return filtered

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_task = serializer.validated_data["task"]

        if new_task and not instance.user.user_tasks.filter(task=new_task).exists():
            raise ValidationError(f"User doesn't have task {new_task.id} assigned")

        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListAllTasks(ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by("-updated")


class UpdateTimeRecordViewSet(ModelViewSet):
    serializer_class = UpdateTimeRecordSerializer
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_queryset(self):
        return TimeRecord.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        # updated_task = get_object_or_404(Task, pk=request.data['task'])
        # updated_task_project = Task.objects.filter(id=request.data['task']).get().project

        # check if user is part of project the task belongs to
        # is_project_user = UserProject.objects.filter(user=request.user, project=updated_task_project)

        # if is_project_user.exists():
        #     # check if user is admin or assigned to the task
        #     user_role = is_project_user.get().role.name
        #     updated_task_id = updated_task.id
        #     task_has_user = UserTask.objects.filter(user=request.user, task=updated_task_id)
        #     if user_role == RoleEnum.ADMIN.value or task_has_user.exists():
        #         serializer = self.get_serializer(instance, data=request.data, partial=partial)
        #         serializer.is_valid(raise_exception=True)
        #         self.perform_update(serializer)
        #     else:
        #         raise ValidationError(f"You are not assigned to this task")
        # else:
        #     raise ValidationError(f"Task doesn't exist")
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class TaskTimeRecordViewSet(ModelViewSet):
    serializer_class = TaskTimeRecordSerializer
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [isProjectAdminOrMember]
        else:
            permission_classes = [isProjectAdmin | IsProjectMember]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return TimeRecord.objects.filter(task__project_id=self.kwargs["project_pk"], task_id=self.kwargs["task_pk"])


class ProjectTimeRecordViewSet(ModelViewSet):
    serializer_class = ProjectTimeRecordSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [isProjectAdminOrMember]
        else:
            permission_classes = [isProjectAdmin | IsProjectMember]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return TimeRecord.objects.filter(task__project_id=self.kwargs["project_pk"])


class ProjectViewSet(ModelViewSet):
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectSerializer

        if self.request.method == "GET":
            return ProjectDetailSerializer

        if self.request.method == "PATCH":
            return UpdateProjectSerializer

        if self.request.method == "POST":
            return CreateProjectSerializers

        return ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(project_users__user_id=self.request.user.id,
                                      project_users__role__isnull=False).order_by("-updated")
        # .filter(Q(project_users__role__name="member") | Q(project_users__role__name="admin"))

    def filter_queryset(self, queryset):
        filtered = ProjectFilter(self.request.GET, queryset=queryset).qs
        return filtered


class ProjectTaskViewSet(ModelViewSet):
    permission_classes = [isProjectAdminOrMember]

    def get_serializer_class(self):
        if self.request.method in ["POST", "PATCH"]:
            return ProjectTaskSerializer
        return TaskSerializer

    def get_serializer_context(self):
        return {"project_id": self.kwargs["project_pk"]}

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs["project_pk"]).select_related("project").order_by("-updated")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        user = self.request.user
        project_users = (
            UserProject.objects
            .filter(project=serializer.data['project'])
            .values_list('user', flat=True)
            .exclude(user=user)
        )
        users = User.objects.filter(id__in=project_users)
        create_notifications(Notification, users=users, type=NotificationTypeEnum.TASK.value,
                             severity=NotificationSeverityChoices.INFO.value, created_by=user.email,
                             action=NotificationActionEnum.CREATED.value, target_id=task.id, target_name=task.name)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TaskViewSet(ModelViewSet):
    permission_classes = [isTaskProjectAdminOrMember]

    def get_serializer_class(self):
        if self.request.method in ["POST", "PATCH", "GET"]:
            return ProjectTaskSerializer
        return TaskSerializer


    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by("-updated")

    def filter_queryset(self, queryset):
        filtered = TaskFilter(self.request.GET, queryset=queryset).qs
        return filtered

    def retrieve(self, request, *args, **kwargs):
        task = get_object_or_404(Task, id=self.kwargs["pk"])
        serializer = TaskSerializer(task)
        return JsonResponse(data=serializer.data, status=status.HTTP_200_OK)


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # request.user
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        request.user.tasks.add(task)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TaskUsers(ModelViewSet):
    permission_classes = [isProjectAdminOrMember]

    def get_serializer_class(self):
        if self.request.method in ["POST"]:
            return AddUserTaskSerializer
        return UserTaskSerializer

    def get_serializer_context(self):
        return {"task_id": self.kwargs["task_pk"]}

    def get_queryset(self):
        return UserTask.objects.filter(task__project_id=self.kwargs["project_pk"])


class FilterAPIView(APIView):

    def get(self, request):
        qs = Project.objects.all()

        projects_values = self.request.query_params.get('projects', None)
        if projects_values:
            projects_ids = tuple(map(int, projects_values.split(',')))
            qs = qs.filter(id__in=projects_ids)

        serializer = ProjectSerializer(qs, many=True)

        return Response(serializer.data)


class RenderPDFView(View):

    def get(self, request, *args, **kwargs):
        print(self)
        return HttpResponse("Hello, World!")

    def filter_projects(self, request):
        ps = Project.objects.all()
        print(self.request)

        projects = Project.objects.filter(
            project_users__user_id=self.request.user.id,
            project_users__role__name__in=[RoleEnum.ADMIN.value, RoleEnum.MEMBER.value]
        )

        # projects_values = request.GET.get('projects', None)
        #
        # if projects_values:
        #     projects_ids = tuple(map(int, projects_values.split(',')))
        #     projects = projects.filter(id__in=projects_ids)
        #
        # return projects

        # rewrite with django-filters
        project_filter = ProjectFilter(request.GET, queryset=projects).qs
        return project_filter.distinct()

    def render_to_pdf(self, template_src, context_dict={}):
        template = get_template(template_src)
        html = template.render(context_dict)
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)
        if not pdf.err:
            return HttpResponse(result.getvalue(), content_type='application/pdf')
        return None


# Opens up page as PDF
class StandardPDFView(RenderPDFView):
    def get(self, request, *args, **kwargs):
        projects = self.filter_projects(request)
        data = {
            "projects": [project.to_dict() for project in projects]
            # "projects": RenderPDFView.filter_projects(self, request)
        }

        pdf = self.render_to_pdf('pdf_standard.html', data)
        return HttpResponse(pdf, content_type='application/pdf')


class DetailedPDFView(RenderPDFView):
    def get(self, request, *args, **kwargs):
        projects = self.filter_projects(request)
        data = {
            "projects": [project.to_dict() for project in projects]
        }

        pdf = self.render_to_pdf('pdf_detailed.html', data)
        return HttpResponse(pdf, content_type='application/pdf')


class PDFHTMLView(RenderPDFView):
    def get(self, request, *args, **kwargs):
        projects = self.filter_projects(request)
        data = {
            "projects": [project.to_dict() for project in projects]
        }
        return render(request, 'pdf_detailed.html', data)


# Automatically downloads to PDF file
class DownloadPDFView(RenderPDFView):
    def get(self, request, *args, **kwargs):
        pdf = self.render_to_pdf('pdf_standard.html', data)

        response = HttpResponse(pdf, content_type='application/pdf')
        filename = "Report_%s.pdf" % "12341231"
        content = "attachment; filename='%s'" % filename
        response['Content-Disposition'] = content
        return response


def index(request):
    context = {}
    return render(request, 'index.html', context)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    token_obtain_pair = TokenObtainPairView.as_view()
