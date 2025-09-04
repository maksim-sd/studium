from typing import List
from ninja.main import NinjaAPI
from ninja.security import HttpBasicAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Group, Balance, CategoryProduct, ProductStatus, Product, PurchaseStatus, Purchase, ChatStatus, Chat, ChatMessages,  TaskStatus, TypeReward, Tag, Task, TaskTag, Feedback, Response
from .shemas import Auth, Registration, UserOut, BalenceOut, СlassifierOut, ProductOut, PurchaseOut, ChatOut


api = NinjaAPI(csrf=True)


class BasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        return authenticate(username=username, password=password)


def check_group(user:User, list_name:list):
    for i in list_name:
        if user.groups.filter(name=i).exists():
            return True
    return False

@api.post("auth/", summary="Вход", tags=["Пользователь"])
def post_auth(request, playload: Auth):
    user = authenticate(username=playload.username, password=playload.password)
    if user is None:
        raise HttpError(401, "Неверно указаны данные")
    return {"message": "Пользователь успешно вошел в систему"}

@api.post("registration/", summary="Регистрация", tags=["Пользователь"])
def post_registration(request, playload: Registration):
    if User.objects.filter(username=playload.username).exists():
        raise HttpError(409, "Пользователь уже зарегистрирован")
    elif playload.password != playload.password2:
        raise HttpError(400, "Пароль не совпадает")
    user = User.objects.create_user(username=playload.username, password=playload.password)
    group = get_object_or_404(Group, name="Исполнитель")
    user.groups.add(group)
    Balance.objects.create(user=user)
    return {"message": "Пользователь успешно зарегистрирован"}

@api.get("profile/", auth=BasicAuth(), response=UserOut, summary="Профиль текущего пользователя", tags=["Пользователь"])
def get_my_profile(request):
    return request.auth

@api.get("profile/{id}/", auth=BasicAuth(), response=UserOut, summary="Профиль выбранного пользователя", tags=["Пользователь"])
def get_profile(request, id):
    return get_object_or_404(User, id=id)

@api.get("profile/balance/", auth=BasicAuth(), response=BalenceOut, summary="Баланс текущего пользователя", tags=["Пользователь"])
def get_profile_balance(request):
    user = request.auth
    if not check_group(user, ["Исполнитель"]):
        raise HttpError(400, "У данного пользователя отсутствует балланс")
    return get_object_or_404(Balance, executor=user)

@api.get("categories/", auth=BasicAuth(), response=List[СlassifierOut], summary="Категории товара", tags=["Категория и товар"])
def get_categories(request):
    return CategoryProduct.objects.all()

@api.get("category/{id}/", auth=BasicAuth(), response=СlassifierOut, summary="Выбранная категория товара", tags=["Категория и товар"])
def get_category(request, id):
    return get_object_or_404(CategoryProduct, id=id)

@api.get("category/{id}/products/", auth=BasicAuth(), response=List[ProductOut], summary="Товары выбранной категории", tags=["Категория и товар"])
def get_category_products(request, id):
    category = get_object_or_404(CategoryProduct, id=id)
    return Product.objects.filter(category=category)

@api.get("product_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы товара", tags=["Категория и товар"])
def get_product_statuses(request):
    return ProductStatus.objects.all()

@api.get("product_status/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Выбранный статус товара", tags=["Категория и товар"])
def get_product_status(request, id):
    return get_object_or_404(ProductStatus, id=id)

@api.get("products/", auth=BasicAuth(), response=List[ProductOut], summary="Товары", tags=["Категория и товар"])
def get_products(request):
    return Product.objects.all()

@api.get("product/{id}", auth=BasicAuth(), response=ProductOut, summary="Выбранный товар", tags=["Категория и товар"])
def get_product(request, id):
    return get_object_or_404(Product, id=id)

@api.get("purchase_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы покупки", tags=["Покупка"])
def get_purchase_statuses(request):
    return PurchaseStatus.objects.all()

@api.get("purchase_status/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Выбранный статус покупки", tags=["Покупка"])
def get_purchase_status(request, id):
    return get_object_or_404(PurchaseStatus, id=id)

@api.get("profile/purchases/", auth=BasicAuth(), response=List[PurchaseOut], summary="Покупки текущего пользователя", tags=["Пользователь"])
def get_profile_purchases(request):
    user = request.auth
    if not check_group(user, ["Исполнитель"]):
        raise HttpError(400, "Данный пользователь не может иметь покупки")
    return Purchase.objects.filter(executor=user)

@api.get("profile/purchase/{id}", auth=BasicAuth(), response=List[PurchaseOut], summary="Выбранная покупка текущего пользователя", tags=["Пользователь"])
def get_profile_purchase(request, id):
    user = request.auth
    if not check_group(user, ["Исполнитель"]):
        raise HttpError(400, "Данный пользователь не может иметь покупки")
    return Purchase.objects.filter(executor=user, id=id)

@api.get("purchases/", auth=BasicAuth(), response=List[PurchaseOut], summary="Покупки всех исполнителей", tags=["Покупка"])
def get_purchases(request):
    user = request.auth
    if not check_group(user, ["Модератор"]):
        raise HttpError(403, "Не достаточно прав")
    return Purchase.objects.all()

@api.get("purchase/{id}", auth=BasicAuth(), response=List[PurchaseOut], summary="Выбранная покупка исполнителя", tags=["Покупка"])
def get_purchase(request, id):
    user = request.auth
    if not check_group(user, ["Модератор"]):
        raise HttpError(403, "Не достаточно прав")
    return Purchase.objects.filter(id=id)

@api.patch("purchase/{id_purchase}/status/{id_status}", auth=BasicAuth(), summary="Изменить статус выбранной покупки исполнителя", tags=["Покупка"])
def patch_purchase_status(request, id_purchase, id_status):
    user = request.auth
    if not check_group(user, ["Модератор"]):
        raise HttpError(403, "Не достаточно прав")
    purchase = get_object_or_404(Purchase, id=id_purchase)
    status = get_object_or_404(PurchaseStatus, id_status)
    purchase.purchase_status = status
    purchase.save()
    return {"message": f"Статус покупки №{id_purchase} успешно изменен"}

@api.get("chat_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы чата", tags=["Чат"])
def get_chat_statuses(request):
    return ChatStatus.objects.all()

@api.get("chat_status/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Выбранный статус чата", tags=["Чат"])
def get_chat_status(request, id):
    return get_object_or_404(ChatStatus, id=id)

@api.get("profile/chats/", auth=BasicAuth(), response=List[ChatOut], summary="Чаты текущего пользователя", tags=["Пользователь"])
def get_profile_chats(request):
    user = request.auth
    chats = Chat.objects.filter(
        task__in=Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user),
        chat__isnull=False
        )
    ).distinct()
    return chats

@api.get("profile/chat/{id}", auth=BasicAuth(), response=ChatOut, summary="Выбранный чат текущего пользователя", tags=["Пользователь"])
def get_profile_chat(request, id):
    user = request.auth
    chat = get_object_or_404(Chat, id=id)
    tasks = Task.objects.filter(Q(customer=user) | Q(moderator=user) | Q(executor=user), chat=chat)
    if not tasks.exists():
        raise HttpError(403, "У текущего пользователя нет доступа к данному чату")
    return chat

# 

@api.get("task_statuses/", auth=BasicAuth(), response=List[СlassifierOut], summary="Статусы задачи", tags=["Задача"])
def get_task_statuses(request):
    return TaskStatus.objects.all()

@api.get("task_status/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Статус задачи", tags=["Задача"])
def get_task_status(request, id):
    return get_object_or_404(TaskStatus, id=id)

@api.get("types_reward/", auth=BasicAuth(), response=List[СlassifierOut], summary="Типы вознаграждения", tags=["Задача"])
def get_types_reward(request):
    return TypeReward.objects.all()

@api.get("type_reward/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Тип вознаграждения", tags=["Задача"])
def get_type_reward(request, id):
    return get_object_or_404(TypeReward, id=id)

@api.get("tags/", auth=BasicAuth(), response=List[СlassifierOut], summary="Теги", tags=["Задача"])
def get_task_tags(request):
    return Tag.objects.all()

@api.get("tag/{id}", auth=BasicAuth(), response=СlassifierOut, summary="Выбранный тег", tags=["Задача"])
def get_tag(request, id):
    return get_object_or_404(Tag, id=id)