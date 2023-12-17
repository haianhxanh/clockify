from datetime import date
from time import strftime

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.db.models import Q
from django.http import Http404, HttpResponseForbidden
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.generic import TemplateView
from django.views.generic.edit import CreateView, UpdateView
from rest_framework import status
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework.generics import ListAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS, AllowAny
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
# from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django.core.exceptions import PermissionDenied
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template
from django.views import View
from rest_framework_simplejwt.authentication import JWTAuthentication, JWTTokenUserAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from xhtml2pdf import pisa
import jwt
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken

from notifications.enums import NotificationSeverityChoices, NotificationTypeEnum, NotificationActionEnum
from notifications.models import create_notifications, TaskNotification, Notification
from clockify import settings
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
    FilterSerializer, RegisterSerializer, UserRestRegisterSerializer,
    # CustomTokenObtainPairSerializer,
)
from .enums import RoleEnum
from .filters import ProjectFilter
from .forms import RegistrationForm
from .models import Project, Task, TimeRecord, User, UserProject, UserTask
from .permissions import isProjectAdmin, IsProjectMember, IsGuest, isProjectAdminOrMember, isAuthenticated
# from .permissions import isTaskProjectAdminOrMember
from .permissions import isProjectAdmin, IsProjectMember, IsGuest, isProjectAdminOrMember


# from workspace.permissions import isProjectAdmin


def home(request):
    return render(request, "workspace/home.html")


class SSORedirectView(View):
    def get(self, request, **kwargs):
        # ...
        return redirect("frontend url", data={"token": "token"})
    
class UserView(ModelViewSet):
    def get_user(self):
        user_token = self.request.COOKIES['access_token']
        if user_token:
            payload = jwt.decode(user_token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = User.objects.get(id=user_id)
            return user
        else:
            user = self.request.user
            return user


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


class RestRegister(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User()
        user.set_password(serializer.validated_data["password"])
        user.email = serializer.validated_data.get("email")
        user.username = serializer.validated_data["username"]
        user.save()

        refresh = RefreshToken.for_user(user)
        token = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        data = UserRestRegisterSerializer(instance=user).data
        data['access_token'] = token['access']
        response = Response(data, status=status.HTTP_201_CREATED)
        response.set_cookie(key='access_token', value=token['access'],
                            expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                            httponly=True)
        # return Response(UserRestRegisterSerializer(instance=user).data, status=status.HTTP_201_CREATED)
        return response


class RestLogin(APIView):

    def post(self, request):
        response = Response()
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        user = authenticate(username=username, password=password)

        if not user:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            refresh = RefreshToken.for_user(user)
            token = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            response.set_cookie(key='access_token', value=token['access'],
                                expires=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
                                httponly=True)
            response.data = {"access_token": token['access']}
            response.headers['Authorization'] = f"JWT {token['access']}"
            print(response.headers)
            return response


class Logout(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user_token = request.COOKIES.get('access_token', None)
        if user_token:
            response = Response()
            response.delete_cookie('access_token')
            response.data = {
                'message': 'Logged out successfully.'
            }
            return response
        response = Response()
        response.data = {
            'message': 'User is already logged out.'
        }
        return response


class UserAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user_token = request.COOKIES.get('access_token')

        if not user_token:
            raise AuthenticationFailed('Unauthenticated user.')

        payload = jwt.decode(user_token, settings.SECRET_KEY, algorithms=['HS256'])
        # print(payload)
        user = User.objects.filter(id=payload['user_id']).first()
        # print(user)
        return Response(UserRestRegisterSerializer(user).data)




class TrackingStart(APIView):
    permission_classes = [IsAuthenticated]

    # kill all running
    def find_and_kill_all_running(self, user):
        running_timers = TimeRecord.objects.filter_running_timers(user)
        for timer in running_timers:
            timer.stop_time()

    # start new
    def post(self, request):
        serializer = TimeRecordStartSerializer(data=request.POST)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        start_time = strftime("%H:%M")
        date_now = date.today()
        self.find_and_kill_all_running(request.user)
        time_record = serializer.save(start_time=start_time, date=date_now, user=request.user)
        response_serializer = TimeRecordSerializer(time_record)
        # TimeRecord.objects.create(**serializer.validated_data, start_time=start_time, date=date_now,
        # user=request.user)
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
        return TimeRecord.objects.filter(user=self.request.user)

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


class UpdateTimeRecordViewSet(ModelViewSet):
    serializer_class = UpdateTimeRecordSerializer
    permission_classes = [isProjectAdmin | IsProjectMember]

    def get_queryset(self):
        return TimeRecord.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        updated_task = get_object_or_404(Task, pk=request.data['task'])
        updated_task_project = Task.objects.filter(id=request.data['task']).get().project

        # check if user is part of project the task belongs to
        is_project_user = UserProject.objects.filter(user=request.user, project=updated_task_project)

        if is_project_user.exists():
            # check if user is admin or assigned to the task
            user_role = is_project_user.get().role.name
            updated_task_id = updated_task.id
            task_has_user = UserTask.objects.filter(user=request.user, task=updated_task_id)
            if user_role == RoleEnum.ADMIN.value or task_has_user.exists():
                serializer = self.get_serializer(instance, data=request.data, partial=partial)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
            else:
                raise ValidationError(f"You are not assigned to this task")
        else:
            raise ValidationError(f"Task doesn't exist")
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


class ProjectViewSet(UserView):
    permission_classes = [isProjectAdmin | IsProjectMember]
    # authentication_classes = [TokenAuthentication]
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
        # return Project.objects.filter(project_users__user_id=self.request.user.id,
        #                               project_users__role__isnull=False).order_by("-updated")
        # user = self.get_user()
        return Project.objects.filter(project_users__user_id=self.request.user.id, project_users__role__isnull=False)
        # .filter(Q(project_users__role__name="member") | Q(project_users__role__name="admin"))


class TaskViewSet(ModelViewSet):
    permission_classes = [isProjectAdminOrMember]

    def get_serializer_class(self):
        if self.request.method in ["POST", "PATCH"]:
            return ProjectTaskSerializer
        return TaskSerializer

    def get_serializer_context(self):
        return {"project_id": self.kwargs["project_pk"]}

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs["project_pk"]).select_related("project")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
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

    def filter_projects(self, request):
        # projects = Project.objects.all()

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
        # projects = self.filter_projects(request)
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
