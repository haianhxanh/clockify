from rest_framework import serializers

from notifications.models import Notification, TaskNotification


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = '__all__'


class NotificationsBulkUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ('id', 'read')


class MarkAllNotificationRead(serializers.Serializer):
    read_all = serializers.BooleanField(required=True)
