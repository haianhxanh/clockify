from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path
from notifications.consumers import NotificationConsumer

routing = ProtocolTypeRouter({
    'websocket': AllowedHostsOriginValidator(
        URLRouter([
            path('', NotificationConsumer)
        ])
    )
})