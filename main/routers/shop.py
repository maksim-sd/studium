from typing import List
from ninja import Router
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.db import transaction
from .profile import BasicAuth
from profile.models import Balance, CategoryProduct, Cart, CartProduct, Product, Order, OrderProduct
from profile.schemas import CategoryProductOut, ClassifierOut, ProductOut, CartProductOut, OrderOut, OrderProductOut, CartProductIDIn


router = Router(tags=["Магазин"])

# Категория и товар

@router.get("/categories/", auth=BasicAuth(), response=List[CategoryProductOut], summary="Категории товара", tags=["Категория и товар"])
def get_categories(request):
    return CategoryProduct.objects.all()

@router.get("/category/{int:id}/", auth=BasicAuth(), response=CategoryProductOut, summary="Выбранная категория товара", tags=["Категория и товар"])
def get_category(request, id:int):
    return get_object_or_404(CategoryProduct, id=id)

@router.get("/category/{int:id}/products/", auth=BasicAuth(), response=List[ProductOut], summary="Товары выбранной категории", tags=["Категория и товар"])
def get_category_products(request, id:int):
    category = get_object_or_404(CategoryProduct, id=id)
    return Product.objects.filter(category_product=category)

@router.get("/product_statuses/", auth=BasicAuth(), response=List[ClassifierOut], summary="Статусы товара", tags=["Категория и товар"])
def get_product_statuses(request):
    return [{"id": id, "name": name} for id, name in Product.STATUS_CHOICES]

@router.get("/products/", auth=BasicAuth(), response=List[ProductOut], summary="Товары", tags=["Категория и товар"])
def get_products(request):
    return Product.objects.all()

@router.get("/product/{int:id}/", auth=BasicAuth(), response=ProductOut, summary="Выбранный товар", tags=["Категория и товар"])
def get_product(request, id:int):
    return get_object_or_404(Product, id=id)

# Корзина

@router.get("/cart/", auth=BasicAuth(), response=List[CartProductOut], summary="Корзина текущего пользователя", tags=["Корзина"])
def get_cart(request):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может иметь корзину")
    cart, _ = Cart.objects.get_or_create(executor=user)
    return CartProduct.objects.filter(cart=cart)

@router.post("/cart/product/{int:id}/", auth=BasicAuth(), summary="Добавить выбранный товар в корзину", tags=["Корзина"])
def post_cart_product(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может добавлять товары в корзину")
    cart, _ = Cart.objects.get_or_create(executor=user)
    product = get_object_or_404(Product, id=id)
    cart_product, created = CartProduct.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_product.quantity += 1
        cart_product.save()
    return {"message": f"Товар №{id} успешно добавлен в корзину"}
 
@router.patch("/cart/product/{int:id}/increase/", auth=BasicAuth(), summary="Увеличить количество выбранного товара в корзине на 1", tags=["Корзина"])
def patch_cart_product_increase(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может добавлять товары в корзину")
    cart = get_object_or_404(Cart, executor=user)
    product = get_object_or_404(Product, id=id)
    cart_product = get_object_or_404(CartProduct, cart=cart, product=product)
    cart_product.quantity += 1
    cart_product.save()
    return {"message": f"Количество товара №{id} в корзине успешно увеличено на 1"}   
    
@router.patch("/cart/product/{int:id}/decrease/", auth=BasicAuth(), summary="Уменьшить количество выбранного товара в корзине на 1", tags=["Корзина"])
def patch_cart_product_decrease(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может добавлять товары в корзину")
    cart = get_object_or_404(Cart, executor=user)
    product = get_object_or_404(Product, id=id)
    cart_product = get_object_or_404(CartProduct, cart=cart, product=product)
    cart_product.quantity -= 1
    if cart_product.quantity <= 0:
        cart_product.delete()
        return {"message": f"Товар №{id} успешно удален из корзины"} 
    cart_product.save()
    return {"message": f"Количество товара №{id} в корзине успешно уменьшено на 1"}       

@router.delete("/cart/product/{int:id}/", auth=BasicAuth(), summary="Удалить выбранный товар из корзины", tags=["Корзина"])
def delete_cart_product(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может удалять товары из корзины")
    cart = get_object_or_404(Cart, executor=user)
    product = get_object_or_404(Product, id=id)
    cart_products = get_object_or_404(CartProduct, cart=cart, product=product)
    cart_products.delete()
    return {"message": f"Товар №{id} успешно удален из корзины"}    

# Заказ

@router.get("/orders/", auth=BasicAuth(), response=List[OrderOut], summary="Заказы текущего пользователя", tags=["Заказ"])
def get_orders(request):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может иметь заказы")
    return Order.objects.filter(executor=user)

@router.get("/order/{int:id}/", auth=BasicAuth(), response=List[OrderProductOut], summary="Детали выбранного заказа текущего пользователя", tags=["Заказ"])
def get_order(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может иметь заказы")
    order = get_object_or_404(Order, id=id, executor=user)
    return OrderProduct.objects.filter(order=order)

@router.post("order/", auth=BasicAuth(), summary="Оформить заказ", tags=["Заказ"])
def post_order(request, payload:CartProductIDIn):
    user = request.auth
    if not user.groups.filter(name="Исполнитель").exists():
        raise HttpError(403, "Данный тип пользователей не может оформлять заказы")
    cart = get_object_or_404(Cart, executor=user)
    cart_products = CartProduct.objects.filter(id__in=payload.cart_product_id, cart=cart)
    if not cart_products.exists() or len(cart_products) != len(payload.cart_product_id):
        raise HttpError(400, "Некорректно указаны id товаров")
    balance = get_object_or_404(Balance, executor=user)
    total_amount = sum(cart_product.product.price * cart_product.quantity for cart_product in cart_products)
    if balance.number_points < total_amount:
        raise HttpError(400, f"Недостаточно баллов для оформления заказа (требуется: {total_amount}, доступно: {balance.number_points})")
    with transaction.atomic():
        balance.number_points -= total_amount
        balance.save()
        order = Order.objects.create(executor=user)
        for cart_product in cart_products:
            if cart_product.quantity > cart_product.product.stock:
                raise HttpError(400, F"Указанное количество товара №{cart_product.product.id} нет в наличии")
            elif cart_product.product.product_status != "AVAILABLE":
                raise HttpError(400, F"Указанный товар №{cart_product.product.id} не доступен для продажи")
            OrderProduct.objects.create(order=order, product=cart_product.product, quantity=cart_product.quantity, price=cart_product.product.price)
            cart_product.product.stock -= cart_product.quantity
            cart_product.product.save()
            cart_product.delete()
    return {"message": f"Заказ №{order.id} успешно оформлен"}    

@router.get("order_statuses/", auth=BasicAuth(), response=List[ClassifierOut], summary="Статусы заказа", tags=["Заказ"])
def get_order_statuses(request):
    return [{"id": id, "name": name} for id, name in Order.STATUS_CHOICES]

@router.patch("order/{int:id_order}/status/{str:id_status}/", auth=BasicAuth(), summary="Изменить статус выбранного заказа исполнителя", tags=["Заказ"])
def patch_order_status(request, id_order:int, id_status:str):
    user = request.auth
    if not user.groups.filter(name="Модератор").exists():
        raise HttpError(403, "Недостаточно прав")
    order = get_object_or_404(Order, id=id_order)
    if order.order_status == "CANCELED":
        raise HttpError(400, "Нельзя изменить статус отмененного заказа №{id_order}")
    elif not id_status in [i[0] for i in Order.STATUS_CHOICES]:
        raise HttpError(404, f"Статус заказа №'{id_status}' не существует")
    order.order_status = id_status
    order.save()
    if id_status == "CANCELED":
        with transaction.atomic():
            order_products = OrderProduct.objects.filter(order=order)
            total_amount = sum(i.price * i.quantity for i in order_products)
            balance = get_object_or_404(Balance, executor=order.executor)
            balance.number_points += total_amount
            balance.save()
            for order_product in order_products:
                order_product.product.stock += order_product.quantity
                order_product.product.save()
    return {"message": f"Статус заказа №{id_order} успешно изменен на '{order.get_order_status_display()}'"}

@router.get("/executors/orders/", auth=BasicAuth(), response=List[OrderOut], summary="Заказы всех исполнителей", tags=["Заказ"])
def get_executors_orders(request):
    user = request.auth
    if not user.groups.filter(name="Модератор").exists():
        raise HttpError(403, "Данный тип пользователей не может просматривать чужие заказы")
    return Order.objects.all()

@router.get("/executor/order/{int:id}/", auth=BasicAuth(), response=List[OrderProductOut], summary="Выбранный заказ исполнителя", tags=["Заказ"])
def get_executor_order(request, id:int):
    user = request.auth
    if not user.groups.filter(name="Модератор").exists():
        raise HttpError(403, "Данный тип пользователей не может просматривать чужие заказы")
    order = get_object_or_404(Order, id=id)
    return OrderProduct.objects.filter(order=order)




