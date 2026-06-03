from typing import List
from django.utils import timezone
from datetime import timedelta

from ninja import Router, UploadedFile, Query, File, Path
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db.models.functions import Concat
from django.db import transaction

from user.router import BasicAuth, CUSTOMER, MODERATOR, EXECUTOR
from user.models import CustomUser, Balance, Group, ExecutorData
from .models import (
    CategoryProject, 
    Technology, 
    Project, 
    ProjectFiles, 
    Response, 
    Feedback, 
    Chat, 
    ChatMessages, 
    MessageFiles, 
    ChatUsers
)
from .schemas import (
    ClassifierOut, 
    TypeProject,
    CategoryProjectOut,
    StatusesOut, 
    ProjectOut,
    ProjectCompletedOut,
    ProjectResponseOut,
    ProjectChatOut, 
    ProjectDetailsOut,
    ProjectParticipantsOut,
    ProjectFileOut, 
    ProjectIn, 
    ResponseIn, 
    ResponseOut, 
    ResponsesListIdIn, 
    ProjectChangeIn, 
    FeedbackIn, 
    ChatOut, 
    ChatMessageOut, 
    LastMessageOut,
    MessageFileOut, 
    ChatMessageIn, 
    ChatMessageUpdateIn, 
    ExecutorListOut,
    ModeratorListOut
)


MAX_SIZE_FILE_PROJECT = 500 # размер в МБ
MAX_COUNT_FILES_PROJECT = 5
MAX_COUNT_EXECUTORS = 3
MAX_COUNT_MODERATORS = 3
MAX_SIZE_FILE_CHAT = 500 # размер в МБ
MAX_COUNT_FILES_CHAT = 5

router = Router(tags=["Проект"])


# Проект


@router.get("/categories/", auth=BasicAuth(), response=List[CategoryProjectOut], summary="Категории проекта")
def get_categories(request):
    return CategoryProject.objects.all()


@router.get("/technologies/", auth=BasicAuth(), response=List[ClassifierOut], summary="Технологии")
def get_technologies(request):
    return Technology.objects.all()


@router.get("/statuses/", auth=BasicAuth(), response=List[StatusesOut], summary="Статусы проекта")
def get_statuses(request):
    return [{"id": id, "name": name} for id, name in Project.STATUS_CHOICES]


@router.get("/types/", auth=BasicAuth(), response=List[TypeProject], summary="Типы проекта")
def get_types(request):
    return [
        {"type_project": type_project, "number_of_points": number_of_points[1]} 
        for type_project, number_of_points in zip(Project.PROJECT_TYPE, Project.NUMBER_OF_POINTS_CHOICES)
    ]


@router.get("/", auth=BasicAuth(), response=List[ProjectOut], summary="Список доступных проектов")
def get_projects(
    request, 
    search:str=Query(None, description="Название или описание проекта"),
    category_id:List[int]=Query(None, description="ID категории / категорий проекта"),
    technologies_id:List[int]=Query(None, description="ID технологии / технологий проекта")
):
    projects = Project.objects.ordered_by_status()
    projects = projects.filter(project_status="LOOKING_FOR_EXECUTOR")
    if search:
        projects = projects.filter(Q(name__iregex=search) | Q(description__iregex=search))
    if category_id:
        projects = projects.filter(category_project__id__in=category_id)
    if technologies_id:
        projects = projects.filter(technologies__id__in=technologies_id).distinct()
    projects_out = []
    for project in projects:
        project_out=ProjectOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        projects_out.append(project_out)
    return projects_out


@router.get(
    "/responses/", 
    auth=BasicAuth(), 
    response=List[ProjectResponseOut], 
    summary="Проекты на которые откликнулся текущий пользователь"
)
def get_responses_user(
    request, 
    search:str=Query(None, description="Название или описание проекта"),
    category_id:List[int]=Query(None, description="ID категории / категорий проекта"),
    technologies_id:List[int]=Query(None, description="ID технологии / технологий проекта")
):
    user = request.auth
    if not user.groups.filter(name=EXECUTOR).exists():
        raise HttpError(400, "Данный пользователь не может иметь отклики")
    responses = (Response.objects.filter(executor=user, project__project_status="LOOKING_FOR_EXECUTOR")
                 .select_related('project')
                 .prefetch_related('project__technologies', 'project__category_project')
    )
    if search:
        responses = responses.filter(Q(project__name__iregex=search) | Q(project__description__iregex=search))
    if category_id:
        responses = responses.filter(project__category_project__id__in=category_id)
    if technologies_id:
        responses = responses.filter(project__technologies__id__in=technologies_id).distinct()
    projects_response_out = []
    for response in responses:
        project = response.project
        project_response_out = ProjectResponseOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points,
            response_comment=response.comment,
            response_create_at=response.created_at
        )
        projects_response_out.append(project_response_out)
    return projects_response_out


@router.get("/moderation/", auth=BasicAuth(), response=List[ProjectOut], summary="Проекты, требующие модерации")
def get_projects_moderation(
    request, 
    search:str=Query(None, description="Название или описание проекта"),
    category_id:List[int]=Query(None, description="ID категории / категорий проекта"),
    technologies_id:List[int]=Query(None, description="ID технологии / технологий проекта")
):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    projects = Project.objects.ordered_by_status()
    projects = projects.filter(Q(project_status="UNDER_INSPECTION") | Q(project_status="LOOKING_FOR_EXECUTOR"))
    if search:
        projects = projects.filter(Q(name__iregex=search) | Q(description__iregex=search))
    if category_id:
        projects = projects.filter(category_project__id__in=category_id)
    if technologies_id:
        projects = projects.filter(technologies__id__in=technologies_id).distinct()
    projects_out = []
    for project in projects:
        project_out=ProjectOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        projects_out.append(project_out)
    return projects_out


@router.get(
    "/active/", 
    auth=BasicAuth(), 
    response=List[ProjectOut], 
    summary="Проекты в которых участвует текущий пользователь"
)
def get_projects_active(request):
    user = request.auth
    projects = Project.objects.ordered_by_status().filter(
        Q(customer=user) | Q(moderators=user) | Q(executors=user),
        project_status__in=[
            "IN_PROGRESS",
            "LOOKING_FOR_EXECUTOR",
            "UNDER_INSPECTION"
        ]
    )
    projects_out = []
    for project in projects:
        project_out=ProjectOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        projects_out.append(project_out)
    return projects_out


@router.get(
    "/{int:id_user}/active/", 
    auth=BasicAuth(), 
    response=List[ProjectOut], 
    summary="Проекты в которых участвует выбранный пользователь"
)
def get_projects_user_active(request, id_user:int = Path(..., description="ID пользователя")):
    user = get_object_or_404(CustomUser, id=id_user)
    projects = Project.objects.ordered_by_status().filter(
        Q(customer=user) | Q(moderators=user) | Q(executors=user),
        project_status__in=[
            "IN_PROGRESS",
            "LOOKING_FOR_EXECUTOR",
            "UNDER_INSPECTION"
        ]
    )
    projects_out = []
    for project in projects:
        project_out=ProjectOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        projects_out.append(project_out)
    return projects_out


@router.get(
    "/history/", 
    auth=BasicAuth(), 
    response=List[ProjectCompletedOut], 
    summary="Проекты в которых участвовал текущий пользователь"
)
def get_projects_history(request):
    user = request.auth
    projects = Project.objects.ordered_by_status().filter(
        Q(customer=user) | Q(moderators=user) | Q(executors=user),
        project_status="COMPLETED"
    ).distinct()
    projects_out = []
    for project in projects:
        project_out=ProjectCompletedOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        feedback_project = Feedback.objects.filter(project=project).first()
        if feedback_project:
            project_out.number_stars = feedback_project.number_stars
            project_out.comment = feedback_project.comment
        projects_out.append(project_out)
    return projects_out


@router.get(
    "/{int:id_user}/history/", 
    auth=BasicAuth(), 
    response=List[ProjectCompletedOut], 
    summary="Проекты в которых участвовал выбранный пользователь"
)
def get_projects_user_history(request, id_user:int = Path(..., description="ID пользователя")):
    user = get_object_or_404(CustomUser, id=id_user)
    projects = Project.objects.ordered_by_status().filter(
        Q(customer=user) | Q(moderators=user) | Q(executors=user),
        project_status="COMPLETED"
    )
    projects_out = []
    for project in projects:
        project_out=ProjectCompletedOut(
            id=project.id,
            project_status=project.get_project_status_display,
            category_project_id=project.category_project_id,
            custom_category_project=project.custom_category_project,
            technologies_id=[tech.id for tech in project.technologies.all()],
            custom_technologies=project.custom_technologies,
            name=project.name,
            description=project.description,
            cash_reward=project.cash_reward,
            number_of_points=project.number_of_points
        )
        feedback_project = Feedback.objects.filter(project=project).first()
        if feedback_project:
            project_out.number_stars = feedback_project.number_stars
            project_out.comment = feedback_project.comment
        projects_out.append(project_out)
    return projects_out


def permission_change_project(user:CustomUser, project:Project):
    if user == project.customer and project.project_status == "UNDER_INSPECTION":
        return True
    elif user in project.moderators.all() and project.project_status not in ("IN_PROGRESS", "COMPLETED", "CANCELED"):
        return True
    return False


def permission_publish_project(user:CustomUser, project:Project):
    if not user.groups.filter(name=MODERATOR).exists():
        return False
    elif project.project_status != "UNDER_INSPECTION":
        return False
    return True


def permission_complete_project(user:CustomUser, project:Project):
    if project.customer != user:
        return False
    elif project.project_status != "IN_PROGRESS":
        return False
    return True


def permission_cancel_project(user:CustomUser, project:Project):
    if project.customer != user and not user.groups.filter(name=MODERATOR).exists():
        return False
    elif project.project_status in ("IN_PROGRESS", "COMPLETED", "CANCELED"):
        return False
    return True


def permission_leave_respond_project(user:CustomUser, project:Project):
    if not user.groups.filter(name=EXECUTOR).exists():
        return False
    elif project.project_status != "LOOKING_FOR_EXECUTOR":
        return False
    elif Response.objects.filter(project=project, executor=user).exists():
       return False
    return True


def permission_view_responses_project(user:CustomUser, project:Project):
    if not user.groups.filter(name=MODERATOR).exists():
        return False
    elif project.project_status != "LOOKING_FOR_EXECUTOR":
        return False
    return True


def permission_view_participants_project(user:CustomUser, project:Project):
    if project.project_status not in ("IN_PROGRESS", "COMPLETED"):
        return False
    if user != project.customer and user not in project.moderators.all() and user not in project.executors.all():
        return False
    return True


def permission_leave_feedback_project(user:CustomUser, project:Project):
    if project.customer != user:
        return False
    elif project.project_status != "COMPLETED":
        return False
    elif Feedback.objects.filter(project=project).exists():
        return False
    return True

@router.get("/{int:id_project}/", auth=BasicAuth(), response=ProjectDetailsOut, summary="Подробнее о выбранном проекте")
def get_project(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(
        Project.objects
        .select_related("customer", "category_project")
        .prefetch_related("technologies", "files"),
        id=id_project
    )
    permission = {
        "change": permission_change_project(user, project),
        "publish": permission_publish_project(user, project),
        "complete": permission_complete_project(user, project),
        "cancel": permission_cancel_project(user, project),
        "leave_respond": permission_leave_respond_project(user, project),
        "view_responses": permission_view_responses_project(user, project),
        "view_participants": permission_view_participants_project(user, project),
        "leave_feedback": permission_leave_feedback_project(user, project),
    }
    project_detail_out = ProjectDetailsOut(
        id=project.id,
        customer=project.customer,
        project_status=project.get_project_status_display(),
        category_project_id=project.category_project_id,
        custom_category_project=project.custom_category_project,
        technologies_id=[tech.id for tech in project.technologies.all()],
        custom_technologies=project.custom_technologies,
        name=project.name,
        description=project.description,
        cash_reward=project.cash_reward,
        number_of_points=project.number_of_points,
        due_date=project.due_date,
        created_at=project.created_at,
        completed_at=project.completed_at,
        files=[ProjectFileOut(id=file.id, file=file.file.url) for file in project.files.all()], 
        permission=permission 
    )
    return project_detail_out


@router.get(
    "/{int:id_project}/participants/", 
    auth=BasicAuth(), 
    response=ProjectParticipantsOut, 
    summary="Участники выбранного проекта"
)
def get_project_participants(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(
        Project.objects
        .select_related("customer",)
        .prefetch_related("moderators", "executors"),
        id=id_project
    )
    if not permission_view_participants_project(user, project):
        raise HttpError(400, "Недоступно")
    participants_out = ProjectParticipantsOut(
        customer=project.customer,
        moderators=project.moderators,
        executors=project.executors
    )
    return participants_out


@router.post("/", auth=BasicAuth(), summary="Создать проект")
def post_project(
    request, 
    payload:ProjectIn, 
    files:List[UploadedFile] = File(None, description="Список файлов проекта")
):
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


@router.put("/{int:id_project}/", auth=BasicAuth(), summary="Изменить выбранный проект")
def put_project(
    request, 
    payload:ProjectChangeIn, id_project:int = Path(..., description="ID проекта"), 
    new_files:List[UploadedFile] = File(None, description="Список новых файлов проекта")
):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_change_project(user, project):
        raise HttpError(400, "Недоступно")
    with transaction.atomic():
        data = payload.dict()
        if data["new_category_project_id"]:
            project.category_project_id = data["new_category_project_id"]
        if data["new_custom_category_project"]:
            project.new_custom_category_project = data["new_custom_category_project"]
        if data["new_custom_technologies"]:
            project.new_custom_technologies = data["new_custom_technologies"]
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
        delete_files_id = data.pop("delete_files_id")
        if new_files or delete_files_id:
            count_files = ProjectFiles.objects.filter(project=project).count()
            count_files = count_files - len(delete_files_id or []) + len(new_files or [])
            if count_files > MAX_COUNT_FILES_PROJECT:
                raise HttpError(400, "Недопустимое количество файлов")    
            for id in delete_files_id or []:
                project_file = get_object_or_404(ProjectFiles, project=project, id=id)
                project_file.delete()
            for file in new_files or []:
                if file.size > MAX_SIZE_FILE_PROJECT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                ProjectFiles.objects.create(project=project, file=file)
        project.save()    
    return {"detail": "Проект изменен"}


@router.put("/{int:id_project}/publish/", auth=BasicAuth(), summary="Опубликовать выбранный проект")
def put_project_publish(
    request, 
    payload:ProjectChangeIn, id_project:int = Path(..., description="ID проекта"), 
    new_files:List[UploadedFile] = File(None, description="Список новых файлов проекта")
):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_publish_project(user, project):
        raise HttpError(400, "Недоступно")
    with transaction.atomic():
        data = payload.dict()
        if data["new_category_project_id"]:
            project.category_project_id = data["new_category_project_id"]
        if data["new_custom_category_project"]:
            project.new_custom_category_project = data["new_custom_category_project"]
        if data["new_custom_technologies"]:
            project.new_custom_technologies = data["new_custom_technologies"]
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
        delete_files_id = data.pop("delete_files_id")
        if new_files or delete_files_id:
            count_files = ProjectFiles.objects.filter(project=project).count()
            count_files = count_files - len(delete_files_id or []) + len(new_files or [])
            if count_files > MAX_COUNT_FILES_PROJECT:
                raise HttpError(400, "Недопустимое количество файлов")    
            for id in delete_files_id or []:
                project_file = get_object_or_404(ProjectFiles, project=project, id=id)
                project_file.delete()
            for file in new_files or []:
                if file.size > MAX_SIZE_FILE_PROJECT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                ProjectFiles.objects.create(project=project, file=file)
        project.project_status = "LOOKING_FOR_EXECUTOR"
        project.save()    
    return {"detail": "Проект опубликован"}


@router.post("/{int:id_project}/complete/", auth=BasicAuth(), summary="Завершить выбранный проект")
def post_project_complete(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_complete_project(user, project):
        raise HttpError(400, "Недоступно")
    with transaction.atomic():
        project.project_status = "COMPLETED"
        project.completed_at = timezone.now()
        project.save()
        for executor in project.executors.all():
            balance, _ = Balance.objects.get_or_create(executor=executor)
            balance.number_of_points += project.number_of_points
            balance.save()
    return {"detail": "Задача завершена"}


@router.post(
    "/{int:id_project}/feedback/",
    auth=BasicAuth(), 
    summary="Оставить отзыв исполнителю / исполнителям выбранного проекта"
)
def post_project_feedback(request, payload:FeedbackIn, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_leave_feedback_project(user, project):
        raise HttpError(400, "Недоступно")
    data = payload.dict()
    with transaction.atomic():
        number_of_points = Project.NUMBER_OF_POINTS_FEEDBACK[data["number_stars"]]
        for executor in project.executors.all():
            balance, _ = Balance.objects.get_or_create(executor=executor)
            balance.number_of_points += number_of_points
            balance.save()
    Feedback.objects.create(project=project, **data)
    return {"detail": "Отзыв оставлен"}


@router.post("/{int:id_project}/cancel/", auth=BasicAuth(), summary="Отменить выбранный проект")
def post_project_cancel(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_cancel_project(user, project):
        raise HttpError(400, "Недоступно")
    with transaction.atomic():
        project.project_status = "CANCELED"
        project.save()
    return {"detail": "Задача отменена"}


# Отклик и назначение


@router.post(
    "/{int:id_project}/response/", 
    auth=BasicAuth(), 
    summary="Откликнуться на выбранный проект", 
    tags=["Отклик и назначение"]
)
def post_response(request, payload:ResponseIn, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_leave_respond_project(user, project):
        raise HttpError(400, "Недоступно")
    Response.objects.create(project=project, executor=user, **payload.dict())
    return {"detail": "Отклик зарегистрирован"}


@router.get(
    "/{int:id_project}/response/quantity/", 
    auth=BasicAuth(), 
    summary="Количество откликов на выбранный проект", 
    tags=["Отклик и назначение"]
)
def post_response_quantity(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    responses_quantity = Response.objects.filter(project=id_project).count()
    return responses_quantity


@router.get(
    "/{int:id_project}/responses/",
    auth=BasicAuth(), response=List[ResponseOut], 
    summary="Все отклики на выбранный проект", tags=["Отклик и назначение"]
)
def get_responses(request, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if not permission_view_responses_project(user, project):
        raise HttpError(400, "Недоступно")
    responses = Response.objects.filter(project=project)
    return responses


@router.post(
    "/{int:id_project}/responses/appoint/", auth=BasicAuth(), 
    summary="Назначить на проект исполнителя по выбранному отклику / исполнителей по выбранным откликам", 
    tags=["Отклик и назначение"]
)
def post_appoint(request, payload:ResponsesListIdIn, id_project:int = Path(..., description="ID проекта")):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    count_executors = len(payload.responses_id)
    if count_executors > MAX_COUNT_EXECUTORS or count_executors <= 0:
        raise HttpError(400, "Недопустимое количество исполнителей")
    with transaction.atomic():
        project = get_object_or_404(Project, id=id_project)
        project.moderators.add(user)
        if project.project_status != "LOOKING_FOR_EXECUTOR":
            raise HttpError(400, "Проект не находится в статусе поиск исполнителя")
        for response_id in payload.responses_id:
            response = get_object_or_404(Response, id=response_id)
            if response.project != project:
                raise HttpError(400, "Отклик не относится к выбранному проекту")
            project.executors.add(response.executor)
        project.project_status = "IN_PROGRESS"
        project.save()
        Chat.objects.create(project=project)
    return {"detail": "На проект назначен исполнитель / назначены исполнители"}


@router.get(
    "/{int:id_project}/executors/", 
    auth=BasicAuth(), 
    response=List[ExecutorListOut], summary="Список исполнителей", 
    tags=["Отклик и назначение"]
)
def get_executors(
    request, 
    id_project:int = Path(..., description="ID проекта"), 
    study_group:str = Query(None, description="Учебная группа"),
    search:str = Query(None, description="ФИО исполнителя")
):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if user not in project.moderators.all():
        raise HttpError(403, "Недостаточно прав")  
    group = get_object_or_404(Group, name=EXECUTOR)
    if search:
        executors = (
            CustomUser
            .objects
            .annotate(full_name=Concat("last_name", "first_name", "patronymic"))
            .filter(full_name__iregex=search.replace(" ", ""), groups=group)
            .exclude(id__in=project.executors.all())
        )
    else:
        executors = CustomUser.objects.filter(groups=group).exclude(id__in=project.executors.all())
    executors_list = []
    for executor in executors:
        executor_data = ExecutorData.objects.filter(executor=executor).first()
        if study_group:
            if not (executor_data and executor_data.study_group == study_group):
                continue
        executor_out = ExecutorListOut(
            id=executor.id,
            last_name=executor.last_name,
            first_name=executor.first_name,
            patronymic=executor.patronymic,
            study_group = executor_data.study_group if executor_data else None
        )
        executors_list.append(executor_out)
    return executors_list



@router.get(
    "/{int:id_project}/moderators/", 
    auth=BasicAuth(), 
    response=List[ModeratorListOut], 
    summary="Список модераторов", 
    tags=["Отклик и назначение"]
)
def get_moderators(
    request, 
    id_project:int = Path(..., description="ID проекта"), 
    search:str = Query(None, description="ФИО модератора")
):
    user = request.auth
    project = get_object_or_404(Project, id=id_project)
    if user not in project.moderators.all():
        raise HttpError(403, "Недостаточно прав")  
    group = get_object_or_404(Group, name=MODERATOR)
    if search:
        moderators = (
            CustomUser
            .objects
            .annotate(full_name=Concat("last_name", "first_name", "patronymic"))
            .filter(full_name__iregex=search.replace(" ", ""), groups=group)
            .exclude(id__in=project.moderators.all())
        )
    else:
        moderators = CustomUser.objects.filter(groups=group).exclude(id__in=project.moderators.all())
    return moderators


@router.post(
    "/{int:id_project}/executor/{int:id_executor}/",
    auth=BasicAuth(),
    summary="Добавить исполнителя на выбранный проект", 
    tags=["Отклик и назначение"]
)
def post_executor(
    request, 
    id_project:int = Path(..., description="ID проекта"), 
    id_executor:int = Path(..., description="ID исполнителя")
):
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


@router.post(
    "/{int:id_project}/moderator/{int:id_moderator}/", 
    auth=BasicAuth(),
    summary="Добавить модератора на выбранный проект", tags=["Отклик и назначение"]
)
def post_moderator(
    request, 
    id_project:int = Path(..., description="ID проекта"), 
    id_moderator:int = Path(..., description="ID модератора")
):
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


@router.delete(
    "/{int:id_project}/user/{int:id_user}/",
    auth=BasicAuth(),
    summary="Удалить участника из выбранного проекта", tags=["Отклик и назначение"]
)
def delete_user(
    request, 
    id_project:int = Path(..., description="ID проекта"), 
    id_user:int = Path(..., description="ID участника проекта")
):
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
        raise HttpError(400, "Пользователь не является участником в выбранном проекте")
    return {"detail": "Участник удален из проекта"}


# Чат


@router.get(
    "/user/chats/",
    auth=BasicAuth(),
    response=List[ChatOut],
    summary="Чаты текущего пользователя", 
    tags=["Чат"]
)
def get_user_chats(request):
    user = request.auth
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user))
    chats = Chat.objects.ordered_by_last_message().filter(project__in=projects).prefetch_related("project")
    chats_out = []
    for chat in chats:
        chat_user, _ = ChatUsers.objects.get_or_create(chat=chat, user=user)
        unread_count = (
            ChatMessages
            .objects
            .filter(
                chat=chat, 
                id__gt=chat_user.last_read_message_id
            )
            .exclude(user=user)
            .count()
        )
        project = chat.project
        last_message = ChatMessages.objects.filter(chat=chat).prefetch_related("files").first()
        chat_out = ChatOut(
            id=chat.id,
            project=ProjectChatOut(
                id=project.id,
                name=project.name
            ),
            unread_count=unread_count
        )
        if last_message:
            chat_out.last_message=LastMessageOut(
                id=last_message.id,
                user=last_message.user,
                message=last_message.message,
                created_at=last_message.created_at,
                files_are_attached=last_message.files.exists()
            )
        chats_out.append(chat_out)
    return chats_out


@router.get(
    "/user/chat/{int:id_chat}/messages/", 
    auth=BasicAuth(), 
    response=List[ChatMessageOut], 
    summary="Сообщения выбранного чата", tags=["Чат"]
)
def get_chat_messages(request, id_chat:int = Path(..., description="ID чата")):
    user = request.auth
    chat = get_object_or_404(Chat, id=id_chat)
    projects = Project.objects.filter(Q(customer=user) | Q(moderators=user) | Q(executors=user), id=chat.project_id)
    if not projects.exists():
        raise HttpError(403, "Недостаточно прав")
    chat_messages = ChatMessages.objects.filter(chat=chat).prefetch_related("files")
    chat_user, _ = ChatUsers.objects.get_or_create(chat=chat, user=user)
    if chat_messages.last():
        chat_user.last_read_message_id = chat_messages.last().id
    chat_user.save()
    messages = [
        ChatMessageOut(
            id=msg.id,
            chat_id=msg.chat.id,
            user=msg.user,
            message=msg.message,
            created_at=msg.created_at,
            changed=msg.changed,
            files=[MessageFileOut(id=file.id, file=file.file.url) for file in msg.files.all()]
        ) for msg in chat_messages
    ]
    return messages
    

@router.post(
    "/chat/{int:id_chat}/message/", 
    auth=BasicAuth(), 
    summary="Отправить сообщения в выбранный чат", 
    tags=["Чат"]
    )
def post_chat_message(
    request, 
    payload:ChatMessageIn, 
    id_chat:int = Path(..., description="ID чата"),
    files:List[UploadedFile] = File(None, description="Список файлов сообщения")
):
    user = request.auth
    chat = get_object_or_404(Chat, id=id_chat)
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


@router.put("/chat/message/{int:id_message}", auth=BasicAuth(), summary="Обновить выбранное сообщения", tags=["Чат"])
def put_chat_message(
    request, payload:ChatMessageUpdateIn,
    id_message:int = Path(..., description="ID сообщения"),
    new_files:List[UploadedFile] = File(None, description="Список новых фалов сообщения")
):
    user = request.auth
    chat_message = get_object_or_404(ChatMessages, id=id_message)
    if chat_message.user != user:
        raise HttpError(403, "Недостаточно прав")
    delete_files_id = payload.delete_files_id
    if (not payload.new_message
        and not chat_message.message
        and not new_files 
        and chat_message.files.count() - len(delete_files_id or []) <= 0):
        raise HttpError(400, "Невозможно отправить пустое сообщение")
    with transaction.atomic():
        if payload.new_message:
            chat_message.message = payload.new_message
            chat_message.changed = True
            chat_message.save()
        if delete_files_id or new_files:
            count_files = chat_message.files.count() - len(delete_files_id or []) + len(new_files or [])
            if count_files > MAX_COUNT_FILES_CHAT:
                raise HttpError(400, "Недопустимое количество файлов")
            for id in delete_files_id or []:
                message_file = get_object_or_404(MessageFiles, chat_message=chat_message, id=id)
                message_file.delete()
            for file in new_files or []:
                if file.size > MAX_SIZE_FILE_CHAT * 1024 * 1024:
                    raise HttpError(400, "Недопустимый размер файла")
                MessageFiles.objects.create(chat_message=chat_message, file=file)
            chat_message.changed = True
            chat_message.save()
    return {"detail": "Сообщение обновлено"}


@router.delete(
    "/chat/message/{int:id_message}/", 
    auth=BasicAuth(), 
    summary="Удалить свое сообщение для всех (можно удалить, если не прошло 24 часа)", 
    tags=["Чат"]
)
def delete_chat_message(request, id_message:int = Path(..., description="ID сообщения")):
    user = request.auth
    chat_message = get_object_or_404(ChatMessages, id=id_message, user=user)
    if (timezone.now() - chat_message.created_at) > timedelta(hours=24):
        raise HttpError(400, "Уже прошло 24 часа")
    chat_message.delete()
    return {"detail": "Сообщение удалено"}