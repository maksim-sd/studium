from typing import List
from ninja import Router
from ninja.security import HttpBasicAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.db.models import Q
from .profile import BasicAuth, check_group
from ..models import User, Group, Balance, CategoryProduct, Cart, CartProduct, Product, Order, OrderProduct, Chat, ChatMessages, Tag, Task, TaskTag, Feedback, Response
from ..shemas import Registration, UserOut, BalanceOut, СlassifierOut, ProductOut, CartOut, CartProductOut, OrderOut, OrderProductOut, CartProductsIDIn, ChatOut


router = Router(tags=["Задача"])

# Чат

# @api.get("chat_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы чата", tags=["Чат"])
# def get_chat_statuses(request):
#     return [{"id": id, "name": name} for id, name in Chat.STATUS_CHOICES]

# @api.get("profile/chats/", auth=BasicAuth(), response=List[ChatOut], summary="Чаты текущего пользователя", tags=["Пользователь"])
# def get_profile_chats(request):
#     user = request.auth
#     chats = Chat.objects.filter(
#         task__in=Task.objects.filter(
#             Q(customer=user) | Q(moderator=user) | Q(executor=user), 
#             chat__isnull=False
#         )
#     ).distinct()
#     return chats

# @api.get("profile/chat/{id}", auth=BasicAuth(), response=ChatOut, summary="Выбранный чат текущего пользователя", tags=["Пользователь"])
# def get_profile_chat(request, id:int):
#     user = request.auth
#     chat = get_object_or_404(Chat, id=id)
#     tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user), chat=chat)
#     if not tasks.exists():
#         raise HttpError(403, "У текущего пользователя нет доступа к данному чату")
#     return chat

# # 

# @api.get("task_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы задачи", tags=["Задача"])
# def get_task_statuses(request):
#     return TaskStatus.objects.all()

# @api.get("task_status/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Статус задачи", tags=["Задача"])
# def get_task_status(request, id):
#     return get_object_or_404(TaskStatus, id=id)

# @api.get("types_reward/", auth=BasicAuth(), response=List[СlassifierOut], summary="Типы вознаграждения", tags=["Задача"])
# def get_types_reward(request):
#     return TypeReward.objects.all()

# @api.get("type_reward/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Тип вознаграждения", tags=["Задача"])
# def get_type_reward(request, id):
#     return get_object_or_404(TypeReward, id=id)

# @api.get("tags/", auth=BasicAuth(), response=List[СlassifierOut], summary="Теги", tags=["Задача"])
# def get_task_tags(request):
#     return Tag.objects.all()

# @api.get("tag/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Выбранный тег", tags=["Задача"])
# def get_tag(request, id):
#     return get_object_or_404(Tag, id=id)