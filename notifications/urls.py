from django.urls import include, path
from . import views

notification_list = views.NotificationViewSet.as_view({'get': 'list', 'put': 'update',
                                                       'patch': 'partial_update'})

notification_details = views.NotificationViewSet.as_view({'get': 'retrieve',
                                                          'put': 'update',
                                                          'patch': 'partial_update',
                                                          'delete': 'destroy'})

notifications_bulk_update = views.NotificationsBulkUpdateViewSet.as_view({'get': 'list', 'patch': 'partial_update'})

urlpatterns = [
    path("notifications/", notification_list),
    path("notifications/<int:pk>/", notification_details, name="notification-details"),
    path("notifications/bulk-update/", notifications_bulk_update, name="notifications-bulk-update")
]
