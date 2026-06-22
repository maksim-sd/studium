import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        if not await self._has_access():
            await self.close()
            return
        self.group_name = f'chat_{self.chat_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    @database_sync_to_async
    def _has_access(self):
        from .models import Chat, Project
        try:
            chat = Chat.objects.get(id=self.chat_id)
        except Chat.DoesNotExist:
            return False
        return Project.objects.filter(
            Q(customer=self.user) | Q(moderators=self.user) | Q(executors=self.user),
            id=chat.project_id,
        ).exists()

    async def message_event(self, event):
        await self.send(text_data=json.dumps(event['data']))


class ChatListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        self.group_name = f'chatlist_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chatlist_update(self, event):
        await self.send(text_data=json.dumps(event['data']))
