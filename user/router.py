from typing import List
from os.path import splitext

from ninja import Router, File, UploadedFile, Path
from ninja.security import HttpBasicAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from django.utils import timezone
from django.db.models import Avg

from .models import Organization, CustomUser, ExecutorData, Balance, Request
from .schemas import GroupOut, OrganizationOut, UserOut, BalanceOut, RequestOut, RequestIn
from project_exchange.models import Feedback, Project


CUSTOMER = "Заказчик"
MODERATOR = "Модератор"
EXECUTOR = "Исполнитель"

MAX_REQUEST_IN_DAY = 3
ALLOWED_user_PHOTO_FORMATS = [".jpeg", ".jpg", ".png"]

router = Router(tags=["Профиль"])


class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, email, password):
        return authenticate(email=email, password=password)
    

def create_user_out(user:CustomUser):
    user_out = UserOut(
        id=user.id,
        last_name=user.last_name,
        first_name=user.first_name,
        photo=user.photo,
        groups_id=[i.id for i in user.groups.all()],
    )
    return user_out

def create_user_out_private(user:CustomUser, user_out:UserOut):
    user_out.organization_id = user.organization.id if user.organization else None
    user_out.patronymic = user.patronymic
    if user.groups.filter(name=EXECUTOR).exists():
        executor_data = ExecutorData.objects.filter(executor=user).first()
        if executor_data:
            user_out.faculty = executor_data.faculty
            user_out.specialty = executor_data.specialty
            user_out.study_group = executor_data.study_group
        projects = Project.objects.filter(executors=user)
        feedbacks = Feedback.objects.filter(project__in=projects).aggregate(avg=Avg("number_stars"))
        user_out.average_rating = feedbacks["avg"] or 0
    return user_out


@router.get("/", auth=BasicAuth(), response=UserOut, summary="Профиль текущего пользователя")
def get_current_user(request):
    user = request.auth
    user_out = create_user_out(user)
    user_out = create_user_out_private(user, user_out)
    return user_out


@router.get("/{int:id_user}/", auth=BasicAuth(), response=UserOut, summary="Профиль выбранного пользователя")
def get_user(request, id_user:int=Path(..., description="ID пользователя")):
    current_user = request.auth
    user = get_object_or_404(CustomUser, id=id_user)
    user_out = create_user_out(user)
    if current_user.groups.filter(name=MODERATOR).exists() or current_user == user:
        user_out = create_user_out_private(user, user_out)
    return user_out


@router.get("/groups/", auth=BasicAuth(), response=List[GroupOut], summary="Все группы пользователей")
def get_groups(request):
    return Group.objects.all()


@router.get("/organizations/", auth=BasicAuth(), response=List[OrganizationOut], summary="Все организации")
def get_organizations(request):
    return Organization.objects.all()


@router.get("/study_groups/", auth=BasicAuth(), summary="Все учебные группы")
def get_study_groups(request):
    groups = list(ExecutorData.objects.order_by().values_list('study_group', flat=True).distinct())
    return groups


@router.get("/balance/", auth=BasicAuth(), response=BalanceOut, summary="Баланс текущего пользователя")
def get_balance(request):
    user = request.auth
    if not user.groups.filter(name=EXECUTOR).exists():
        raise HttpError(400, "Данный пользователь не может иметь баланс")
    balance, _ = Balance.objects.get_or_create(executor=user)
    return balance


@router.post("/photo/", auth=BasicAuth(), summary="Установить фото профиля для текущего пользователя")
def post_photo(request, image:UploadedFile = File(..., description="Изображение")):
    if splitext(image.name)[1].lower() not in ALLOWED_user_PHOTO_FORMATS:
        raise HttpError(400, "Недопустимый формат изображения")
    user = request.auth
    user.photo = image
    user.save()
    return {"detail": "Фото профиля установлено"}


@router.get(
    "/requests/", 
    auth=BasicAuth(), 
    response=List[RequestOut], 
    summary="Обращения текущего пользователя", 
    tags=["Обращение"]
)
def get_requests(request):
    user = request.auth
    requests_user = Request.objects.filter(user=user)
    return requests_user


@router.post("/request/", auth=BasicAuth(), summary="Создать обращение", tags=["Обращение"])
def post_request(request, payload:RequestIn):
    user = request.auth
    requests_user = Request.objects.filter(user=user, created_at__date=timezone.now().date())
    if requests_user.count() >= MAX_REQUEST_IN_DAY:
        raise HttpError(400, "Превышено максимальное количество обращений за день")
    if not payload.message:
        raise HttpError(400, "Сообщение не может быть пустым")
    Request.objects.create(user=request.auth, **payload.model_dump())
    return {"detail": "Обращение создано"}