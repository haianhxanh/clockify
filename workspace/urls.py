from django.urls import include, path
from . import views
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import PDFHTMLView, CustomTokenObtainPairView

project_list = views.ProjectViewSet.as_view({'get': 'list', 'post': 'create'})

project_details = views.ProjectViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

project_users_list = views.UserProjectViewSet.as_view({'get': 'list', 'post': 'create'})

project_user_details = views.UserProjectViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

project_tasks_list = views.ProjectTaskViewSet.as_view({'get': 'list', 'post': 'create'})

project_task_details = views.ProjectTaskViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

task_details = views.TaskViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})


task_users_list = views.TaskUsers.as_view({'get': 'list', 'post': 'create'})

task_user_details = views.TaskUsers.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

task_time_records_list = views.TaskTimeRecordViewSet.as_view({'get': 'list'})

task_time_record_details = views.TaskTimeRecordViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

project_time_records = views.ProjectTimeRecordViewSet.as_view({
    'get': 'list'
})

project_time_record_details = views.ProjectTimeRecordViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

time_records_list = views.TimeRecordViewSet.as_view({'get': 'list'})

time_record_detail = views.TimeRecordViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

update_time_record_detail = views.UpdateTimeRecordViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# stop_time_record = views.TrackingStop.as_view({
#     'get': 'retrieve',
#     'put': 'update',
#     'patch': 'partial_update',
# })


urlpatterns = [
    path("", views.home, name="home"),
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),
    path("auth/sso/callback", views.SSORedirectView.as_view(), name="sso-auth"),
    path("register/", views.Register.as_view(), name="register"),
    path("projects/", project_list, name="list-projects"),
    path("projects/<int:pk>/", project_details, name="project-details"),
    path("projects/<int:project_pk>/users/", project_users_list, name="list-project-users"),
    path("projects/<int:project_pk>/users/<pk>/", project_user_details, name="project-user-detail"),
    path("projects/<int:project_pk>/tasks/", project_tasks_list, name="list-project-tasks"),
    path("projects/<int:project_pk>/tasks/<pk>/", project_task_details, name="project-task-details"),
    path("projects/<int:project_pk>/tasks/<int:task_pk>/users/", task_users_list, name="list-task-users"),
    path("projects/<int:project_pk>/tasks/<int:task_pk>/users/<pk>/", task_user_details, name="task-user-details"),
    path("projects/<int:project_pk>/tasks/<int:task_pk>/tracking/", task_time_records_list,
         name="list-task-time-records"),
    path("projects/<int:project_pk>/tasks/<int:task_pk>/tracking/<pk>/", task_time_record_details,
         name="time-record-details"),
    path("projects/<int:project_pk>/tracking/", project_time_records, name="list-project-time-records"),
    path("projects/<int:project_pk>/tracking/<pk>/", project_time_record_details,
         name="project-time-record-details"),
    path("tasks/", views.ListAllTasks.as_view(), name="list-tasks"),
    path("tasks/<pk>/", task_details, name="task-details"),
    path("users/", views.ListAllUsers.as_view(), name="list-users"),
    path("tracking/", time_records_list, name="list-time-records"),
    path("tracking/<pk>/", time_record_detail, name="time-record-detail"),
    path("tracking/<pk>/update", update_time_record_detail, name="update-time-record-detail"),
    path("tracking/start", views.TrackingStart.as_view(), name="tracker-start"),
    path("tracking/stop", views.TrackingStop.as_view(), name="tracker-stop"),
    path('__debug__/', include('debug_toolbar.urls')),
    path('report/', views.FilterAPIView.as_view()),
    path('pdf/standard/', views.StandardPDFView.as_view(), name="pdf-standard"),
    path('pdf/detailed/', views.DetailedPDFView.as_view(), name="pdf-detailed"),
    path('pdf_download/', views.DownloadPDFView.as_view(), name="pdf_download"),
    path('test/', PDFHTMLView.as_view(), name="pdf_html"),
    path('api/login/', CustomTokenObtainPairView.as_view()),
    path('api/login/refresh/', TokenRefreshView.as_view()),
    # path('api/login/', include('rest_social_auth.urls_jwt_pair')),
    path("invitations/", include('invitations.urls', namespace='invitations')),
]

