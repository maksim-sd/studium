from typing import List
from ninja import Router, Query
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.db import transaction
from datetime import timedelta
from .profile import BasicAuth
from main.models import User, Balance, Chat, ChatMessage, MessageFile, Tag, Task, TaskTag, Feedback, Response
from main.schemas import ClassifierOut, ChatOut, ChatMessageOut, MessageFileOut, ChatMessageIn, TaskOut, TaskIn, TagOut, ResponseIn, ResponseOut, FeedbackIn, FeedbackOut


router = Router(tags=["Задача"])

# Чат

@router.get("/chat_statuses/", auth=BasicAuth(), response=List[ClassifierOut], summary="Статусы чата", tags=["Чат"])
def get_chat_statuses(request):
    return [{"id": id, "name": name} for id, name in Chat.STATUS_CHOICES]

@router.get("/chats/", auth=BasicAuth(), response=List[ChatOut], summary="Чаты текущего пользователя", tags=["Чат"])
def get_chats(request):
    user = request.auth
    chats = Chat.objects.filter(
        task__in=Task.objects.filter(
            Q(customer=user) | Q(moderator=user) | Q(executor=user), 
            chat__isnull=False
        )
    ).distinct()
    return chats

@router.get("/chat/{int:id}/", auth=BasicAuth(), response=ChatOut, summary="Выбранный чат", tags=["Чат"])
def get_chat(request, id:int):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user), chat=chat)
    if not tasks.exists():
        raise HttpError(403, "У текущего пользователя нет доступа к данному чату")
    return chat

@router.get("/chat/{int:id}/messages/", auth=BasicAuth(), response=List[ChatMessageOut], summary="Сообщения выбранного чата", tags=["Чат"])
def get_chat_messages(request, id:int):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user), chat=chat)
    if not tasks.exists():
        raise HttpError(403, "У текущего пользователя нет доступа к данному чату")
    chat_messages = ChatMessage.objects.filter(chat=chat).prefetch_related("messagefiles_set")
    messages = [
        ChatMessageOut(
            id=msg.id,
            chat=msg.chat,
            user=msg.user,
            message=msg.message,
            created_at=msg.created_at,
            files=[MessageFileOut(id=file.id, file=file.file.url) for file in msg.messagefiles_set.all()]
        ) for msg in chat_messages
    ]
    return messages
    
@router.post("/chat/{int:id}/message/", auth=BasicAuth(), summary="Отправить сообщения в выбранный чат", tags=["Чат"])
def post_chat_message(request, id:int, payload:ChatMessageIn):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user), chat=chat)
    if not tasks.exists():
        raise HttpError(403, "У текущего пользователя нет доступа к данному чату")
    elif chat.chat_status == "Недоступен":
        raise HttpError(400, "Невозможно отправить сообщение, так как чат недоступен")
    elif not payload.message and not payload.files:
        raise HttpError(400, "Невозможно отправить пустое сообщение")
    MAX_SIZE_FILE = 2 * 1024 * 1024 * 1024
    with transaction.atomic():
        chat_message = ChatMessage.objects.create(chat=chat, user=user, message=payload.message)
        for file in payload.files:
            if file.size > MAX_SIZE_FILE:
                raise HttpError(400, f"Файл {file.name} слишком большой {file.size}. Максимальный размер {MAX_SIZE_FILE}")
            MessageFile.objects.create(chat_message=chat_message, file=file)
    return {"message": f"Сообщение №{chat_message.id} успешно отправлено"}


@router.delete("/chat/message/{int:id}/", auth=BasicAuth(), summary="Удалить свое сообщение для всех (можно удалить, если не прошло 24 часа)", tags=["Чат"])
def delete_chat_message(request, id:int):
    user = request.auth
    chat_message = get_object_or_404(ChatMessage, id=id, user=user)
    if chat_message.chat.chat_status == "Недоступен":
        raise HttpError(400, "Невозможно удалить сообщение, так как чат недоступен")
    elif (timezone.now() - chat_message.created_at) > timedelta(hours=24):
        raise HttpError(400, "Невозможно удалить сообщение, так как прошло 24 часа")
    chat_message.delete()
    return {"message": f"Сообщение №{id} успешно удалено"}

# Задача

@router.get("/statuses/", auth=BasicAuth(), response=List[ClassifierOut], summary="Статусы задачи")
def get_task_statuses(request):
    return [{"id": id, "name": name} for id, name in Task.STATUS_CHOICES]

@router.get("/types_reward/", auth=BasicAuth(), response=List[ClassifierOut], summary="Типы вознаграждения")
def get_types_reward(request):
    return [{"id": id, "name": name} for id, name in Task.TYPE_REWARD_CHOICES]

@router.get("/", auth=BasicAuth(), response=List[TaskOut], summary="Задачи")
def get_tasks(request, task_status:str=Query(None, description="Статус задачи"), 
              search:str=Query(None, description="Поиск в названии и описании"), 
              tags_id:List[int]=Query(None, description="Теги")):
    tasks = Task.objects.all()
    if task_status is not None:
        tasks = tasks.filter(task_status=task_status)
    if search is not None:
        tasks = tasks.filter(Q(name__iregex=search) | Q(description__iregex=search)).distinct()
    if tags_id is not None:
        tasks = tasks.filter(tasktag_set__tag__id__in=tags_id).distinct()
    return tasks

@router.get("/{int:id}/", auth=BasicAuth(), response=TaskOut, summary="Выбранная задача")
def get_task(request, id:int):
    return get_object_or_404(Task, id=id)

@router.get("/user/", auth=BasicAuth(), response=List[TaskOut], summary="Задачи текущего пользователя")
def get_tasks_user(request):
    user = request.auth
    tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user)).distinct()
    return tasks

@router.post("/", auth=BasicAuth(), summary="Создать задачу")
def post_task(request, payload: TaskIn):
    user = request.auth
    if not user.groups.filter(name="Заказчик").exists():
        raise HttpError(403, "Данный тип пользователей не может создавать задачи")
    task = Task.objects.create(customer=user, task_status="A", **payload.dict())
    return {"message": f"Задача №{task.id} успешно создана"}

@router.post("/{int:id}/response/", auth=BasicAuth(), summary="Откликнуть на выбранную задачу", tags=["Отклик"])
def post_response(request, id:int, payload: ResponseIn):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может откликаться на задачи")
    task = get_object_or_404(Task, id=id)
    if task.task_status != "A":
        raise HttpError(400, f"На задачу №{id} невозможно откликнуться")
    response = Response.objects.create(task=task, executor=user, **payload.dict())
    return {"message": f"Отклик №{response.id} на задачу №{id} успешно зарегистрирован"}

@router.get("/{int:id}/responses/", auth=BasicAuth(), response=List[ResponseOut], summary="Все отклики на выбранную задачу", tags=["Отклик"])
def get_responses(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Модератор").exists():
        raise HttpError(403, "Данный тип пользователей не может просматривать отклики")
    task = get_object_or_404(Task, id=id)
    if task.task_status != "A":
        raise HttpError(400, f"На задачу №{id} невозможно посмотреть отклики")
    responses = Response.objects.filter(task=task)
    return responses

@router.post("/response/{int:id}", auth=BasicAuth(), summary="Назначить исполнителя на задачу из выбранного отклика")
def post_response_executor(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Модератор").exists():
        raise HttpError(403, "Данный тип пользователей не может назначать исполнителей")
    response = get_object_or_404(Response, id=id)
    task = response.task
    if task.task_status != "A":
        raise HttpError(400, f"На задачу №{id} невозможно назначить исполнителя")
    task.moderator = user
    task.executor = response.executor
    task.task_status = "B"
    chat = Chat.objects.create()
    task.chat = chat
    task.save()
    return {"message": f"На задачу №{task.id} успешно назначен исполнитель {task.executor.username}"}

@router.post("/{int:id}/complete/", auth=BasicAuth(), summary="Завершить выбранную задачу")
def post_task_complete(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Заказчик").exists():
        raise HttpError(403, "Данный тип пользователей не может завершать задачи")
    task = get_object_or_404(Task, id=id)
    if task.customer != user:
        raise HttpError(403, f"Текущий пользователь не имеет прав для завершения задачи №{id}")
    elif task.task_status != "B" or task.task_status == "C":
        raise HttpError(400, f"Задачу №{id} невозможно завершить")
    with transaction.atomic():
        task.task_status = "C"
        task.completed_at = timezone.now()
        task.chat.chat_status = "B"
        task.save()
        task.chat.save()
        if task.type_reward == "A" and task.amount_reward is not None:
            balance = get_object_or_404(Balance, executor=task.executor)
            balance.number_points += task.amount_reward
            balance.save()
    return {"message": f"Задача №{id} успешно завершена"}

@router.post("/{int:id}/cancel/", auth=BasicAuth(), summary="Отменить выбранную задачу")
def post_task_cancel(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Заказчик").exists():
        raise HttpError(403, "Данный тип пользователей не может отменять задачи")
    task = get_object_or_404(Task, id=id)
    if task.customer != user:
        raise HttpError(403, f"Текущий пользователь не имеет прав для отмены задачи №{id}")
    elif task.task_status != "C" or task.task_status == "D":
        raise HttpError(400, f"Задачу №{id} невозможно отменить")
    with transaction.atomic():
        task.task_status = "D"
        task.chat.chat_status = "B"
        task.save()
        task.chat.save()
    return {"message": f"Задача №{id} успешно отменена"}

@router.post("/{int:id}/feedback/", auth=BasicAuth(), summary="Оcтавить отзыв исполнителю выбранной задачи", tags=["Отзыв"])
def post_task_feedback(request, id:int, payload:FeedbackIn):
    user = request.auth
    if not user.groups.filter(name="Заказчик").exists():
        raise HttpError(403, "Данный тип пользователей не может оставлять отзывы")
    task = get_object_or_404(Task, id=id)
    if task.customer != user:
        raise HttpError(403, f"Текущий пользователь не может оставить отзыв исполнителю задачи №{id}")
    elif task.task_status != "C":
        raise HttpError(400, f"Невозможно оставить отзыв, так как задача №{id} не завершена")
    elif Feedback.objects.filter(task=task).exists():
        raise HttpError(400, f"Отзыв на исполнителя задачи №{id} уже оставлен")
    feedback = Feedback.objects.create(task=task, **payload.dict())
    return {"message": f"Отзыв №{feedback.id} на исполнителя задачи №{id} успешно оставлен"}

@router.get("/user/{int:id}/feedbacks/", auth=BasicAuth(), response=List[FeedbackOut], summary="Отзывы выбранного исполнителя", tags=["Отзыв"])
def get_user_feedbacks(request, id:int):
    user = get_object_or_404(User, id=id)
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может иметь отзывы")
    return Feedback.objects.filter(task__executor=user)

@router.get("/tags/", auth=BasicAuth(), response=List[TagOut], summary="Теги", tags=["Тег"])
def get_tags(request):
    return Tag.objects.all()

@router.get("/tag/{int:id}/", auth=BasicAuth(), response=TagOut, summary="Выбранный тег", tags=["Тег"])
def get_tag(request, id:int):
    return get_object_or_404(Tag, id=id)

@router.get("/{int:id}/tags/", auth=BasicAuth(), response=List[TagOut], summary="Теги выбранной задачи", tags=["Тег"])
def get_task_tags(request, id:int):
    task = get_object_or_404(Task, id=id)
    task_tags = TaskTag.objects.filter(task=task)
    return [{"id": i.task.id, "name": i.task.name} for i in task_tags]