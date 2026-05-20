import base64
from django.test import TestCase
from django.contrib.auth.models import Group
from ninja.testing import TestClient

from user.models import CustomUser, ExecutorData, Balance
from .models import CategoryProduct, Product, Cart, CartProduct, Order, OrderProduct
from .router import router


def make_auth_headers(email: str, password: str) -> dict:
    token = base64.b64encode(f"{email}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def create_group(name: str) -> Group:
    group, _ = Group.objects.get_or_create(name=name)
    return group


def create_user(email: str, password: str, group_name: str | None = None) -> CustomUser:
    user = CustomUser.objects.create_user(
        email=email,
        password=password,
        last_name="Иванов",
        first_name="Иван",
    )
    if group_name:
        user.groups.add(create_group(group_name))
    return user


def create_executor(email: str, password: str) -> CustomUser:
    user = create_user(email, password, group_name="Исполнитель")
    ExecutorData.objects.create(
        executor=user,
        faculty="ФИСТ",
        specialty="Программная инженерия",
        study_group="ИТ-21",
    )
    return user


def create_product(
    name: str = "Товар",
    price: int = 100,
    stock: int = 10,
    status: str = "AVAILABLE",
    category: CategoryProduct | None = None,
) -> Product:
    return Product.objects.create(
        name=name,
        price=price,
        stock=stock,
        product_status=status,
        category_product=category,
    )


def give_balance(user: CustomUser, points: int) -> Balance:
    balance, _ = Balance.objects.get_or_create(executor=user)
    balance.number_of_points = points
    balance.save()
    return balance


class TestGetCategories(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        CategoryProduct.objects.create(name="Электроника")
        CategoryProduct.objects.create(name="Одежда")

    def test_returns_all_categories(self):
        response = self.client.get("/categories/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
        names = [c["name"] for c in data]
        self.assertIn("Электроника", names)

    def test_no_auth_returns_401(self):
        response = self.client.get("/categories/")
        self.assertEqual(response.status_code, 401)


class TestGetCategory(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        self.category = CategoryProduct.objects.create(name="Электроника")

    def test_returns_existing_category(self):
        response = self.client.get(
            f"/category/{self.category.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Электроника")

    def test_nonexistent_category_returns_404(self):
        response = self.client.get(
            "/category/99999/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetCategoryProducts(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        self.category = CategoryProduct.objects.create(name="Электроника")
        other = CategoryProduct.objects.create(name="Одежда")
        create_product("Ноутбук", category=self.category)
        create_product("Телефон", category=self.category)
        create_product("Футболка", category=other)

    def test_returns_only_category_products(self):
        response = self.client.get(
            f"/category/{self.category.id}/products/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        names = [p["name"] for p in data]
        self.assertIn("Ноутбук", names)
        self.assertNotIn("Футболка", names)

    def test_nonexistent_category_returns_404(self):
        response = self.client.get(
            "/category/99999/products/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetProducts(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        create_product("Товар А")
        create_product("Товар Б")

    def test_returns_all_products(self):
        response = self.client.get("/products/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertIn("product_status", data[0])

    def test_product_status_is_human_readable(self):
        response = self.client.get("/products/", headers=make_auth_headers("exec@example.com", "pass123"))
        data = response.json()
        self.assertEqual(data[0]["product_status"], "В наличии")


class TestGetProduct(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        self.product = create_product("Ноутбук", price=500)

    def test_returns_existing_product(self):
        response = self.client.get(
            f"/product/{self.product.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Ноутбук")
        self.assertEqual(data["price"], 500)

    def test_nonexistent_product_returns_404(self):
        response = self.client.get(
            "/product/99999/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetProductStatuses(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")

    def test_returns_all_statuses(self):
        response = self.client.get("/product_statuses/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ids = [s["id"] for s in data]
        self.assertIn("AVAILABLE", ids)
        self.assertIn("UNAVAILABLE", ids)
        self.assertIn("FUTURE", ids)


class TestGetCart(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        product = create_product("Товар")
        cart, _ = Cart.objects.get_or_create(executor=self.executor)
        CartProduct.objects.create(cart=cart, product=product, quantity=2)

    def test_executor_gets_cart(self):
        response = self.client.get("/cart/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["quantity"], 2)

    def test_customer_cannot_get_cart(self):
        response = self.client.get("/cart/", headers=make_auth_headers("cust@example.com", "pass123"))
        self.assertEqual(response.status_code, 400)

    def test_empty_cart_auto_created(self):
        new_exec = create_executor("exec2@example.com", "pass123")
        response = self.client.get("/cart/", headers=make_auth_headers("exec2@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


class TestPostCartProduct(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        self.product = create_product("Товар")

    def test_executor_adds_product_to_cart(self):
        response = self.client.post(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        cart = Cart.objects.get(executor=self.executor)
        self.assertTrue(CartProduct.objects.filter(cart=cart, product=self.product).exists())

    def test_adding_same_product_increases_quantity(self):
        self.client.post(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.client.post(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        cart = Cart.objects.get(executor=self.executor)
        cp = CartProduct.objects.get(cart=cart, product=self.product)
        self.assertEqual(cp.quantity, 2)

    def test_customer_cannot_add_to_cart(self):
        response = self.client.post(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)

    def test_nonexistent_product_returns_404(self):
        response = self.client.post(
            "/cart/product/99999/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestPatchCartProductIncrease(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        self.product = create_product("Товар")
        cart, _ = Cart.objects.get_or_create(executor=self.executor)
        self.cart_product = CartProduct.objects.create(cart=cart, product=self.product, quantity=1)

    def test_increase_quantity(self):
        response = self.client.patch(
            f"/cart/product/{self.product.id}/increase/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.cart_product.refresh_from_db()
        self.assertEqual(self.cart_product.quantity, 2)

    def test_customer_cannot_increase(self):
        response = self.client.patch(
            f"/cart/product/{self.product.id}/increase/",
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)

    def test_product_not_in_cart_returns_404(self):
        other = create_product("Другой товар")
        response = self.client.patch(
            f"/cart/product/{other.id}/increase/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestPatchCartProductDecrease(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        self.product = create_product("Товар")
        cart, _ = Cart.objects.get_or_create(executor=self.executor)
        self.cart_product = CartProduct.objects.create(cart=cart, product=self.product, quantity=3)

    def test_decrease_quantity(self):
        response = self.client.patch(
            f"/cart/product/{self.product.id}/decrease/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.cart_product.refresh_from_db()
        self.assertEqual(self.cart_product.quantity, 2)

    def test_decrease_to_zero_removes_product(self):
        self.cart_product.quantity = 1
        self.cart_product.save()
        response = self.client.patch(
            f"/cart/product/{self.product.id}/decrease/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(CartProduct.objects.filter(id=self.cart_product.id).exists())

    def test_customer_cannot_decrease(self):
        response = self.client.patch(
            f"/cart/product/{self.product.id}/decrease/",
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)


class TestDeleteCartProduct(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        self.product = create_product("Товар")
        cart, _ = Cart.objects.get_or_create(executor=self.executor)
        self.cart_product = CartProduct.objects.create(cart=cart, product=self.product, quantity=1)

    def test_executor_deletes_product_from_cart(self):
        response = self.client.delete(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(CartProduct.objects.filter(id=self.cart_product.id).exists())

    def test_customer_cannot_delete_from_cart(self):
        response = self.client.delete(
            f"/cart/product/{self.product.id}/",
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)

    def test_product_not_in_cart_returns_404(self):
        other = create_product("Другой товар")
        response = self.client.delete(
            f"/cart/product/{other.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetOrders(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        Order.objects.create(executor=self.executor)
        Order.objects.create(executor=self.executor)

    def test_executor_gets_own_orders(self):
        response = self.client.get("/orders/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_customer_cannot_get_orders(self):
        response = self.client.get("/orders/", headers=make_auth_headers("cust@example.com", "pass123"))
        self.assertEqual(response.status_code, 400)

    def test_order_status_is_human_readable(self):
        response = self.client.get("/orders/", headers=make_auth_headers("exec@example.com", "pass123"))
        data = response.json()
        self.assertEqual(data[0]["order_status"], "Оформлен")


class TestGetOrder(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")
        other = create_executor("other@example.com", "pass123")
        self.product = create_product("Товар", price=100)
        self.order = Order.objects.create(executor=self.executor)
        OrderProduct.objects.create(order=self.order, product=self.product, quantity=2, price=100)
        self.other_order = Order.objects.create(executor=other)

    def test_executor_gets_own_order_details(self):
        response = self.client.get(
            f"/order/{self.order.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["quantity"], 2)
        self.assertEqual(data[0]["price"], 100)

    def test_executor_cannot_get_another_executors_order(self):
        response = self.client.get(
            f"/order/{self.other_order.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)

    def test_nonexistent_order_returns_404(self):
        response = self.client.get(
            "/order/99999/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestPostOrder(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")
        self.product = create_product("Товар", price=100, stock=10)
        self.balance = give_balance(self.executor, 1000)
        cart, _ = Cart.objects.get_or_create(executor=self.executor)
        self.cart_product = CartProduct.objects.create(cart=cart, product=self.product, quantity=2)

    def test_successful_order(self):
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Заказ оформлен", response.json()["detail"])

    def test_order_deducts_balance(self):
        self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.balance.refresh_from_db()
        self.assertEqual(self.balance.number_of_points, 800)

    def test_order_reduces_stock(self):
        self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)

    def test_order_removes_cart_product(self):
        self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertFalse(CartProduct.objects.filter(id=self.cart_product.id).exists())

    def test_insufficient_balance_returns_400(self):
        self.balance.number_of_points = 10
        self.balance.save()
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("баллов", response.json()["detail"].lower())

    def test_unavailable_product_returns_400(self):
        self.product.product_status = "UNAVAILABLE"
        self.product.save()
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)

    def test_insufficient_stock_returns_400(self):
        self.cart_product.quantity = 100
        self.cart_product.save()
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_cart_product_ids_returns_400(self):
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [99999]},
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("id", response.json()["detail"].lower())

    def test_customer_cannot_post_order(self):
        response = self.client.post(
            "/order/",
            json={"cart_product_id": [self.cart_product.id]},
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)


class TestGetOrderStatuses(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.executor = create_executor("exec@example.com", "pass123")

    def test_returns_all_order_statuses(self):
        response = self.client.get("/order_statuses/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        ids = [s["id"] for s in data]
        self.assertIn("CREATED", ids)
        self.assertIn("RECEIVED", ids)
        self.assertIn("CANCELED", ids)


class TestPatchOrderStatus(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Модератор")
        self.executor = create_executor("exec@example.com", "pass123")
        self.moderator = create_user("moder@example.com", "pass123", group_name="Модератор")
        self.product = create_product("Товар", price=100, stock=10)
        self.balance = give_balance(self.executor, 1000)
        self.order = Order.objects.create(executor=self.executor)
        OrderProduct.objects.create(order=self.order, product=self.product, quantity=2, price=100)

    def test_moderator_changes_status_to_received(self):
        response = self.client.patch(
            f"/order/{self.order.id}/status/RECEIVED/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.order_status, "RECEIVED")

    def test_cancel_order_refunds_balance_and_stock(self):
        self.client.patch(
            f"/order/{self.order.id}/status/CANCELED/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.balance.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.balance.number_of_points, 1200)
        self.assertEqual(self.product.stock, 12)

    def test_cannot_change_status_of_already_canceled_order(self):
        self.order.order_status = "CANCELED"
        self.order.save()
        response = self.client.patch(
            f"/order/{self.order.id}/status/RECEIVED/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("отменен", response.json()["detail"].lower())

    def test_invalid_status_returns_404(self):
        response = self.client.patch(
            f"/order/{self.order.id}/status/INVALID/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)

    def test_executor_cannot_change_order_status(self):
        response = self.client.patch(
            f"/order/{self.order.id}/status/RECEIVED/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)

    def test_nonexistent_order_returns_404(self):
        response = self.client.patch(
            "/order/99999/status/RECEIVED/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetExecutorsOrders(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Модератор")
        self.executor = create_executor("exec@example.com", "pass123")
        self.moderator = create_user("moder@example.com", "pass123", group_name="Модератор")
        Order.objects.create(executor=self.executor)
        Order.objects.create(executor=self.executor)

    def test_moderator_gets_all_orders(self):
        response = self.client.get("/executors/orders/", headers=make_auth_headers("moder@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_executor_cannot_get_all_orders(self):
        response = self.client.get("/executors/orders/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 403)


class TestGetExecutorOrder(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Модератор")
        self.executor = create_executor("exec@example.com", "pass123")
        self.moderator = create_user("moder@example.com", "pass123", group_name="Модератор")
        self.product = create_product("Товар", price=100)
        self.order = Order.objects.create(executor=self.executor)
        OrderProduct.objects.create(order=self.order, product=self.product, quantity=1, price=100)

    def test_moderator_gets_order_details(self):
        response = self.client.get(
            f"/executor/order/{self.order.id}/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["price"], 100)

    def test_executor_cannot_get_any_order_via_moderator_endpoint(self):
        response = self.client.get(
            f"/executor/order/{self.order.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 403)

    def test_nonexistent_order_returns_404(self):
        response = self.client.get(
            "/executor/order/99999/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)