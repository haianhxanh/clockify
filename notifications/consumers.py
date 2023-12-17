import json
import sys

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.consumer import AsyncConsumer


# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         if self.scope["user"].is_anonymous:
#             await self.close()
#             return
#
#         self.user = self.scope["user"]
#         self.group_name = "notification"
#
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()
#
#     async def propagate_status(self, event):
#         message = event["message"]
#         await self.send(text_data=json.dumps(message))

# class NotificationConsumer(AsyncConsumer):
#     async def websocket_connect(self, event):
#         notification = 'notification'
#         self.notification = notification
#         await self.channel_layer.group_add(
#             notification, self.channel_name
#         )
#         await self.send({
#             "type": "websocket.accept",
#         })
#
#     async def websocket_receive(self, event):
#         intial_data = event.get('text', None)
#
#         await self.channel_layer.group_send(
#             self.notification, {
#                 'type': "notification_message",
#                 "text": intial_data
#             }
#         )
#
#     async def notification_message(self, event):
#         await self.send({
#             "type": "websocket.send",
#             "text": event["text"],
#         })
#
#     async def websocket_disconnect(self, event):
#         print('Disconnect', event)

class NotificationConsumer(AsyncWebsocketConsumer):
    groups = ["notification"]

    async def connect(self):
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        # todo
        await self.send(text_data="Hello world!")

    async def disconnect(self, close_code):
        print('close')

    async def task(self, event):
        message = event["message"]
        print("message", message)
        await self.send(text_data=json.dumps(message))
