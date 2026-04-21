from ninja import Router
from ninja.security import HttpBasicAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from django.utils import timezone
from profile.models import Organization, CustomUser, ExecutorData, Balance, Request
from profile.schemas import GroupOut, OrganizationOut, UserOut, BalanceOut, RequestOut, RequestIn, UserListOut
from typing import List
from datetime import date


router = Router(tags=["Профиль"])

CUSTOMER = "Заказчик"
MODERATOR = "Модератор"
EXECUTOR = "Исполнитель"

MAX_REQUEST_IN_DAY = 3


class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, email, password):
        return authenticate(email=email, password=password)
    

def create_user_out(user:object):
    user_out = UserOut(
        id=user.id,
        last_name=user.last_name,
        first_name=user.first_name,
        photo=user.photo,
        groups_id=[i.id for i in user.groups.all()]
    )
    return user_out

@router.get("/", auth=BasicAuth(), response=UserOut, summary="Профиль текущего пользователя")
def get_current_profile(request):
    user = request.auth
    user_out = create_user_out(user)
    user_out.organization_id = user.organization.id if user.organization else None
    user_out.patronymic = user.patronymic
    executor_data = ExecutorData.objects.filter(executor=user).first()
    if executor_data:
        user_out.faculty = executor_data.faculty
        user_out.speciality = executor_data.speciality
        user_out.group = executor_data.group
    return user_out

@router.get("/{int:id}/", auth=BasicAuth(), response=UserOut, summary="Профиль выбранного пользователя")
def get_profile(request, id:int):
    current_user = request.auth
    user = get_object_or_404(CustomUser, id=id)
    user_out = create_user_out(user)
    if current_user.groups.filter(name=MODERATOR).exists():
        user_out.organization_id = user.organization.id if user.organization else None
        user_out.patronymic = user.patronymic
        executor_data = ExecutorData.objects.filter(executor=user).first()
        if executor_data:
            user_out.faculty = executor_data.faculty
            user_out.speciality = executor_data.speciality
            user_out.group = executor_data.group
    return user_out

@router.get("/groups/", auth=BasicAuth(), response=List[GroupOut], summary="Все группы")
def get_groups(request):
    return Group.objects.all()

@router.get("/organizations/", auth=BasicAuth(), response=List[OrganizationOut], summary="Все организации")
def get_organizations(request):
    return Organization.objects.all()

@router.get("/balance/", auth=BasicAuth(), response=BalanceOut, summary="Баланс текущего пользователя")
def get_current_balance(request):
    user = request.auth
    if not user.groups.filter(name=EXECUTOR).exists():
        raise HttpError(400, "Данный пользователь не может иметь баланс")
    return get_object_or_404(Balance, executor=user)

@router.get("/requests/", auth=BasicAuth(), response=List[RequestOut], summary="Обращения текущего пользователя", tags=["Обращение"])
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
    Request.objects.create(user=request.auth, **payload.model_dump())
    return "Обращение создано"

@router.get("/executors/", auth=BasicAuth(), response=List[UserListOut], summary="Список исполнителей")
def get_executors(request):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")    
    group = get_object_or_404(Group, name=EXECUTOR)  
    return CustomUser.objects.filter(groups=group)

@router.get("/moderators/", auth=BasicAuth(), response=List[UserListOut], summary="Список модераторов")
def get_moderators(request):
    user = request.auth
    if not user.groups.filter(name=MODERATOR).exists():
        raise HttpError(403, "Недостаточно прав")
    group = get_object_or_404(Group, name=MODERATOR)  
    return CustomUser.objects.filter(groups=group)