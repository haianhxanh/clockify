"""
ASGI config for clockify project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path

from clockify.routing import routing
from notifications.consumers import NotificationConsumer

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clockify.settings')
#
django_asgi_app = get_asgi_application()
#
# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket":  AuthMiddlewareStack(URLRouter(notifications.routing.websocket_urlpatterns)),
# })

from django.core.asgi import get_asgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clockify.settings')
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket":  URLRouter([
            path('ws/notifications/', NotificationConsumer.as_asgi())
        ]),
})
