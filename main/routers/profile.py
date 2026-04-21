from ninja import Router
from ninja.security import HttpBasicAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.db import transaction
from profile.models import User, Group, Balance
from profile.schemas import Registration, UserOut, BalanceOut


router = Router(tags=["Профиль"])


class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        return authenticate(username=username, password=password)
    

@router.post("/registration/", summary="Регистрация для исполнителей")
def post_registration(request, payload: Registration):
    with transaction.atomic():
        if User.objects.filter(username=payload.username).exists():
            raise HttpError(409, "Пользователь уже зарегистрирован")
        elif payload.password != payload.password2:
            raise HttpError(400, "Пароль не совпадает")
        user = User.objects.create_user(username=payload.username, password=payload.password, first_name=payload.first_name, last_name=payload.last_name)
        group = get_object_or_404(Group, name="Исполнитель")
        user.groups.add(group)
        Balance.objects.create(executor=user)
    return {"message": "Пользователь успешно зарегистрирован"}

@router.get("/", auth=BasicAuth(), response=UserOut, summary="Профиль текущего пользователя")
def get_my_profile(request):
    return request.auth

@router.get("/{int:id}/", auth=BasicAuth(), response=UserOut, summary="Профиль выбранного пользователя")
def get_profile(request, id:int):
    return get_object_or_404(User, id=id)

@router.get("/balance/", auth=BasicAuth(), response=BalanceOut, summary="Баланс текущего пользователя")
def get_balance(request):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "У данного типа пользователей отсутствует баланс")
    return get_object_or_404(Balance, executor=user)

