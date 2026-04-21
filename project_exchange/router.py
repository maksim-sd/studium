from typing import List
from ninja import Router, UploadedFile, Query, File
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from profile.router import BasicAuth, CUSTOMER, MODERATOR, EXECUTOR
from profile.models import CustomUser, Balance
from .models import CategoryProject, Technology, Project, ProjectFiles, Response, Feedback, Chat, ChatMessages, MessageFiles
from .schemas import ClassifierOut, StatusesOut, ProjectOut, ProjectDetailsOut, ProjectIn, ResponseIn, ResponseOut, \
    ResponsesListIdIn, ProjectPublishIn, FeedbackIn, FeedbackOut, ChatOut, ChatMessageOut, MessageFileOut, ChatMessageIn

router = Router(tags=["Проект"])

MAX_SIZE_FILE_PROJECT = 500 # размер в МБ
MAX_COUNT_FILES_PROJECT = 5
MAX_COUNT_EXECUTORS = 3
MAX_COUNT_MODERATORS = 3
MAX_SIZE_FILE_CHAT = 500 # размер в МБ
MAX_COUNT_FILES_CHAT = 5

# Проект

@router.get("/categories/", auth=BasicAuth(), response=List[ClassifierOut], summary="Категории проекта")
def get_categories(request):
    return CategoryProject.objects.all()

@router.get("/technologies/", auth=BasicAuth(), response=List[ClassifierOut], summary="Технологии")
def get_technologies(request):
    return Technology.objects.all()

@router.get("/statuses/", auth=BasicAuth(), response=List[StatusesOut], summary="Статусы проекта")
def get_statuses(request):
    return [{"id": id, "name": name} for id, name in Project.STATUS_CHOICES]

@router.get("/", auth=BasicAuth(), response=List[ProjectOut], summary="Список доступных проектов")
def get_projects(request, search:str=Query(None, description="Название или описание проекта"),
                 category_id:List[int]=Query(None, description="ID категории / категорий проекта"),
                 technologies_id:List[int]=Query(None, description="ID технологии / технологий проекта")):
    projects = Project.objects.all()
    projects = projects.filter(project_status="LOOKING_FOR_EXECUTOR")
    if search:
        projects = projects.filter(Q(name__iregex=search) | Q(description__iregex=search))
    if category_id:
        projects = projects.filter(category_project__id__in=category_id)
    if technologies_id:
        projects = projects.filter(technologies__id__in=technologies_id).distinct()
    return projects

@router.get("/moderation/", auth=BasicAuth(), response=List[ProjectOut], summary="Проекты, требующие модерации")
def get_projects_moderation(request, search:str=Query(None, description="Название или описание проекта"),
                 category_id:List[int]=Query(None, description="ID категории / категорий проекта"),
                 technologies_id:List[int]=Query(None, description="ID технологии / технологий проекта")):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    projects = Project.objects.all()
    projects = projects.filter(Q(project_status="UNDER_INSPECTION") | Q(project_status="LOOKING_FOR_EXECUTOR"))
    if search:
        projects = projects.filter(Q(name__iregex=search) | Q(description__iregex=search))
    if category_id:
        projects = projects.filter(category_project__id__in=category_id)
    if technologies_id:
        projects = projects.filter(technologies__id__in=technologies_id).distinct()
    return projects

@router.get("/{int:id}/", auth=BasicAuth(), response=ProjectDetailsOut, summary="Подробнее о выбранном проекте")
def get_project(request, id:int):
    project = (
        Project.objects
        .select_related("customer", "category_project")
        .prefetch_related("moderators", "executors", "technologies", "files")
    ).get(id=id)
    user = request.auth
    if project.project_status == "UNDER_INSPECTION" and not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    elif project.project_status != "LOOKING_FOR_EXECUTOR" \
        and user != project.customer \
        and user not in project.moderators.all() \
        and user not in project.executors.all():
        raise HttpError(403, "Недостаточно прав")
    project_detail_out = ProjectDetailsOut(
        id=project.id,
        customer=project.customer,
        moderators=project.moderators,
        executors=project.executors,
        project_status=project.get_project_status_display(),
        category_project_id=project.category_project_id,
        technologies_id=[i.id for i in project.technologies.all()],
        name=project.name,
        description=project.description,
        cash_reward=project.cash_reward,
        number_of_points=project.number_of_points,
        due_date=project.due_date,
        created_at=project.created_at,
        completed_at=project.completed_at,
        files=[i.file.url for i in project.files.all()]   
    )
    return project_detail_out

@router.get("/user/", auth=BasicAuth(), response=List[ProjectOut], summary="Проекты в которых учавствует текущий пользователь")
def get_projects_user(request):
    user = request.auth
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user))
    return projects

@router.put("/{int:id}/publish/", auth=BasicAuth(), summary="Опубликовать проект")
def put_project(request, id:int, payload:ProjectPublishIn, delete_files:File[List[UploadedFile]]=None, new_files:File[List[UploadedFile]]=None):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    with transaction.atomic():
        data = payload.dict()
        project = get_object_or_404(Project, id=id)
        if project.project_status != "UNDER_INSPECTION":
            raise HttpError(400, "Проект не находится в статусе проверки")
        if data["new_category_project_id"]:
            project.category_project_id = data["new_category_project_id"]
        if data["new_name"]:
            project.name = data["new_name"]
        if data["new_description"]:
            project.description = data["new_description"]
        if data["new_cash_reward"]:
            project.cash_reward = data["new_cash_reward"]
        if data["new_number_of_points"]:
            project.number_of_points = data["new_number_of_points"]
        if data["new_due_date"]:
            project.due_date = data["new_due_date"]
        delete_technologies_id = data.pop("delete_technologies_id")
        new_technologies_id = data.pop("new_technologies_id")
        for technology_id in delete_technologies_id or []:
                technology = get_object_or_404(Technology, id=technology_id)
                project.technologies.remove(technology)
        for technology_id in new_technologies_id or []:
                technology = get_object_or_404(Technology, id=technology_id)
                project.technologies.add(technology)
        if new_files or delete_files:
            count_files = ProjectFiles.objects.filter(project=project).count()
            count_files = count_files - len(delete_files or []) + len(new_files or [])
            if count_files > MAX_COUNT_FILES_PROJECT:
                raise HttpError(400, "Недопустимое количество файлов")    
            for file in delete_files or []:
                project_file = ProjectFiles.objects.filter(project=project, file=file)
                project_file.delete()
            for file in new_files or []:
                if file.size > MAX_SIZE_FILE_PROJECT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                ProjectFiles.objects.create(project=project, file=file)
        project.project_status = "LOOKING_FOR_EXECUTOR"
        project.save()    
    return {"detail": "Проект опубликован"}

@router.post("/", auth=BasicAuth(), summary="Создать проект")
def post_project(request, payload:ProjectIn, files:File[List[UploadedFile]]=None):
    user = request.auth
    if not user.groups.filter(name=CUSTOMER).exists():
        raise HttpError(403, "Недостаточно прав")
    with transaction.atomic():
        data = payload.dict()
        technologies = data.pop("technologies_id")
        project = Project.objects.create(customer=user, project_status="UNDER_INSPECTION", **data)
        if technologies is not None:
            project.technologies.set(technologies)
        if files:
            if len(files) > MAX_COUNT_FILES_PROJECT:
                raise HttpError(400, "Недопустимое количество файлов")    
            for file in files:
                if file.size > MAX_SIZE_FILE_PROJECT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                ProjectFiles.objects.create(project=project, file=file)
    return {"detail": "Проект создан"}

@router.post("/{int:id}/response/", auth=BasicAuth(), summary="Откликнуться на выбранный проект")
def post_response(request, id:int, payload:ResponseIn):
    user = request.auth
    if not user.groups.filter(name=EXECUTOR).exists():
        raise HttpError(403, "Недостаточно прав")
    project = get_object_or_404(Project, id=id)
    if project.project_status != "LOOKING_FOR_EXECUTOR":
        raise HttpError(400, "Проект не находится в статусе поиск исполнителя")
    if Response.objects.filter(project=project, executor=user).exists():
       raise HttpError(400, "Пользователь уже откликнулся на проект") 
    response = Response.objects.create(project=project, executor=user, **payload.dict())
    return {"detail": "Отклик зарегистрирован"}

@router.get("/{int:id}/responses/", auth=BasicAuth(), response=List[ResponseOut], summary="Все отклики на выбранный проект")
def get_responses(request, id:int):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    project = get_object_or_404(Project, id=id)
    if project.project_status != "LOOKING_FOR_EXECUTOR":
        raise HttpError(400, "Проект не находится в статусе поиск исполнителя")
    responses = Response.objects.filter(project=project)
    return responses

@router.post("/{int:id}/responses/appoint/", auth=BasicAuth(), summary="Назначить на проект исполнителя по выбраному отклику / исполнителей по выбраным откликам")
def post_appoint(request, id:int, payload:ResponsesListIdIn):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    count_executors = len(payload.responses_id)
    if count_executors > MAX_COUNT_EXECUTORS or count_executors <= 0:
        raise HttpError(400, "Недопустимое количество исполнителей")
    with transaction.atomic():
        project = get_object_or_404(Project, id=id)
        project.moderators.add(user)
        if project.project_status != "LOOKING_FOR_EXECUTOR":
            raise HttpError(400, "Проект не находится в статусе поиск исполнителя")
        for response_id in payload.responses_id:
            response = get_object_or_404(Response, id=response_id)
            if response.project != project:
                raise HttpError(400, "Отклик не относится к выбраному проекту")
            project.executors.add(response.executor)
        project.project_status = "IN_PROGRESS"
        project.save()
        Chat.objects.create(project=project)
    return {"detail": "На проект назначен исполнитель / назначены исполнители"}

@router.post("/{int:id_project}/executor/{int:id_executor}/", auth=BasicAuth(), summary="Добавить исполнителя на выбранный проект")
def post_executor(request, id_project:int, id_executor:int):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not project.moderators.filter(id=user.id).exists():
        raise HttpError(403, "Недостаточно прав")
    if project.project_status != "IN_PROGRESS":
            raise HttpError(400, "Проект не находится в статусе работы")
    if project.executors.count() >= MAX_COUNT_EXECUTORS:
        raise HttpError(400, "Превышено допустимое количество исполнителей")
    executor = get_object_or_404(CustomUser, id=id_executor)
    if not executor.groups.filter(name=EXECUTOR).exists():
        raise HttpError(400, "Выбранный пользователь не является исполнителем")
    if project.executors.filter(id=id_executor).exists():
        raise HttpError(400, "Пользователь уже является исполнителем в выбранном проекте")    
    project.executors.add(executor)
    return {"detail": "На проект назначен исполнитель"}

@router.post("/{int:id_project}/moderator/{int:id_moderator}/", auth=BasicAuth(), summary="Добавить модератора на выбранный проект")
def post_moderator(request, id_project:int, id_moderator:int):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not project.moderators.filter(id=user.id).exists():
        raise HttpError(403, "Недостаточно прав")
    if project.project_status != "IN_PROGRESS":
            raise HttpError(400, "Проект не находится в статусе работы")
    if project.moderators.count() >= MAX_COUNT_MODERATORS:
        raise HttpError(400, "Превышено допустимое количество модераторов")
    moderator = get_object_or_404(CustomUser, id=id_moderator)
    if not moderator.groups.filter(name=MODERATOR).exists():
        raise HttpError(400, "Выбранный пользователь не является модератором")
    if project.moderators.filter(id=id_moderator).exists():
        raise HttpError(400, "Пользователь уже является модератором в выбранном проекте")    
    project.moderators.add(moderator)
    return {"detail": "На проект успешно назначен модератор"}

@router.delete("/{int:id_project}/user/{int:id_user}/", auth=BasicAuth(), summary="Удалить участника из выбранного проекта")
def delete_user(request, id_project:int, id_user:int):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not project.moderators.filter(id=user.id).exists():
        raise HttpError(403, "Недостаточно прав")
    if project.project_status != "IN_PROGRESS":
            raise HttpError(400, "Проект не находится в статусе работы")
    selected_user = get_object_or_404(CustomUser, id=id_user)
    if project.customer == selected_user:
        raise HttpError(400, "Невозможно удалить заказчика из участников проекта")  
    elif user == selected_user:
        raise HttpError(400, "Невозможно удалить самого себя из участников проекта")
    elif project.moderators.filter(id=selected_user.id).exists():
        project.moderators.remove(selected_user)
    elif project.executors.filter(id=selected_user.id).exists():   
        project.executors.remove(selected_user)
    else:
        raise HttpError(400, "Пользователь не является участником в выбраном проекте")
    return {"detail": "Участник удален из проекта"}

@router.post("/{int:id}/complete/", auth=BasicAuth(), summary="Завершить выбранный проект")
def post_project_complete(request, id:int):
    user = request.auth
    project = get_object_or_404(Project, id=id)
    if project.customer != user:
        raise HttpError(403, "Недостаточно прав")
    elif project.project_status != "IN_PROGRESS":
        raise HttpError(400, "Проект не находится в статусе работы")
    with transaction.atomic():
        project.project_status = "COMPLETED"
        project.completed_at = timezone.now()
        project.save()
        for executor in project.executors.all():
            balance, _ = Balance.objects.get_or_create(executor=executor)
            balance.number_of_points += project.number_of_points
            balance.save()
    return {"detail": "Задача завершена"}

@router.post("/{int:id}/cancel/", auth=BasicAuth(), summary="Отменить выбранный проект")
def post_project_cancel(request, id:int):
    user = request.auth
    project = get_object_or_404(Project, id=id)
    if project.customer != user:
        raise HttpError(403, "Недостаточно прав")
    elif project.project_status == "COMPLETED" or project.project_status == "CANCELED":
        raise HttpError(400, "Проект уже завершен или отменен")
    with transaction.atomic():
        project.project_status = "CANCELED"
        project.save()
    return {"detail": "Задача отменена"}

@router.post("/{int:id}/feedback/", auth=BasicAuth(), summary="Оcтавить отзыв исполнителю выбранного проекта", tags=["Отзыв"])
def post_project_feedback(request, id:int, payload:FeedbackIn):
    user = request.auth
    project = get_object_or_404(Project, id=id)
    if project.customer != user:
        raise HttpError(403, "Только заказчик проекта может выполнить данную операцию")
    elif project.project_status != "COMPLETED":
        raise HttpError(400, "Проект не завершен")
    elif Feedback.objects.filter(project=project).exists():
        raise HttpError(400, "Отзыв уже оставлен")
    Feedback.objects.create(project=project, **payload.dict())
    return {"detail": "Отзыв оставлен"}

@router.get("/user/{int:id}/feedbacks/", auth=BasicAuth(), response=List[FeedbackOut], summary="Отзывы выбранного исполнителя", tags=["Отзыв"])
def get_user_feedbacks(request, id:int):
    user = get_object_or_404(CustomUser, id=id)
    if not user.groups.filter(name=EXECUTOR).exists():
        raise HttpError(400, "Данный пользователь не может иметь отзывы")
    return Feedback.objects.filter(project__executors=user)

# Чат

@router.get("/user/chats/", auth=BasicAuth(), response=List[ChatOut], summary="Чаты текущего пользователя", tags=["Чат"])
def get_user_chats(request):
    user = request.auth
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user))
    chats = Chat.objects.filter(project__in=projects)
    return chats

@router.get("/user/chat/{int:id}/messages/", auth=BasicAuth(), response=List[ChatMessageOut], summary="Сообщения выбранного чата", tags=["Чат"])
def get_chat_messages(request, id:int):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user), id=chat.project_id)
    if not projects.exists():
        raise HttpError(403, "Недостаточно прав")
    chat_messages = ChatMessages.objects.filter(chat=chat).prefetch_related("files")
    messages = [
        ChatMessageOut(
            id=msg.id,
            chat_id=msg.chat.id,
            user=msg.user,
            message=msg.message,
            created_at=msg.created_at,
            files=[MessageFileOut(id=file.id, file=file.file.url) for file in msg.files.all()]
        ) for msg in chat_messages
    ]
    return messages
    
@router.post("/chat/{int:id}/message/", auth=BasicAuth(), summary="Отправить сообщения в выбранный чат", tags=["Чат"])
def post_chat_message(request, id:int, payload:ChatMessageIn, files:File[List[UploadedFile]]=None):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user), id=chat.project_id)
    if not projects.exists():
        raise HttpError(403, "Недостаточно прав")
    elif not payload.message and not files:
        raise HttpError(400, "Невозможно отправить пустое сообщение")
    with transaction.atomic():
        if files is not None and len(files) > MAX_COUNT_FILES_CHAT:
                raise HttpError(400, "Недопустимое количество файлов")
        chat_message = ChatMessages.objects.create(chat=chat, user=user, message=payload.message)
        if files:
            for file in files:
                if file.size > MAX_SIZE_FILE_CHAT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                MessageFiles.objects.create(chat_message=chat_message, file=file)
    return {"detail": "Сообщение отправлено"}

@router.delete("/chat/message/{int:id}/", auth=BasicAuth(), summary="Удалить свое сообщение для всех (можно удалить, если не прошло 24 часа)", tags=["Чат"])
def delete_chat_message(request, id:int):
    user = request.auth
    chat_message = get_object_or_404(ChatMessages, id=id, user=user)
    if (timezone.now() - chat_message.created_at) > timedelta(hours=24):
        raise HttpError(400, "Уже прошло 24 часа")
    chat_message.delete()
    return {"detail": "Сообщение удалено"}