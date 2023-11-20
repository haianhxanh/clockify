from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from notifications.models import Notification
from notifications.serializers import NotificationSerializer, NotificationsBulkUpdateSerializer, MarkAllNotificationRead


# Create your views here.
class NotificationViewSet(ModelViewSet):
    def get_serializer_class(self):
        if self.action == "list":
            return NotificationSerializer

        return NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-updated")


class NotificationsBulkUpdateViewSet(ModelViewSet):
    serializer_class = NotificationsBulkUpdateSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-updated")

    def partial_update(self, request, *args, **kwargs):
        # data = request.data
        # if isinstance(data, list):
        #     serializer = self.get_serializer(data=request.data, many=True)
        # else:
        #     serializer = self.get_serializer(data=request.data)
        # if serializer.is_valid():
        #     print(serializer)
        #     notifications = Notification.objects.filter(user=request.user, read=False)
        #     for notification in notifications:
        #         notification.read = True
        #     Notification.objects.bulk_update(notifications, ['read'])
        #
        # return Response(serializer.data, status=status.HTTP_200_OK)
        data = request.data
        if isinstance(data, list):
            serializer = self.get_serializer(data=request.data, many=True)
        # else:
        #     serializer = self.get_serializer(data=request.data)
        # if serializer.is_valid() and serializer.validated_data["read_all"]:
        if serializer.is_valid():
            Notification.objects.filter(user=request.user, read=False).update(read=True)
            return Response({}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
