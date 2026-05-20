import base64
from django.test import TestCase
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from ninja.testing import TestClient

from .models import Organization, CustomUser, ExecutorData, Balance, Request
from .router import router


def make_auth_headers(email: str, password: str) -> dict:
    token = base64.b64encode(f"{email}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


def create_group(name: str) -> Group:
    group, _ = Group.objects.get_or_create(name=name)
    return group


def create_user(
    email: str,
    password: str,
    last_name: str = "Иванов",
    first_name: str = "Иван",
    group_name: str | None = None,
    organization: Organization | None = None,
) -> CustomUser:
    user = CustomUser.objects.create_user(
        email=email,
        password=password,
        last_name=last_name,
        first_name=first_name,
        organization=organization,
    )
    if group_name:
        group = create_group(group_name)
        user.groups.add(group)
    return user


def create_executor(
    email: str,
    password: str,
    study_group: str = "ИТ-21",
    faculty: str = "ФИСТ",
    specialty: str = "Программная инженерия",
) -> CustomUser:
    user = create_user(email, password, group_name="Исполнитель")
    ExecutorData.objects.create(
        executor=user,
        faculty=faculty,
        specialty=specialty,
        study_group=study_group,
    )
    return user


class TestGetCurrentUser(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        create_group("Модератор")
        self.customer = create_user("customer@example.com", "pass123", group_name="Заказчик")
        self.executor = create_executor("executor@example.com", "pass123")

    def test_customer_profile_success(self):
        response = self.client.get("/", headers=make_auth_headers("customer@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("last_name", data)
        self.assertIn("first_name", data)
        self.assertIsNone(data.get("faculty"))
        self.assertIsNone(data.get("study_group"))

    def test_executor_profile_has_extra_fields(self):
        response = self.client.get("/", headers=make_auth_headers("executor@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["faculty"], "ФИСТ")
        self.assertEqual(data["study_group"], "ИТ-21")
        self.assertIn("average_rating", data)

    def test_wrong_password_returns_401(self):
        response = self.client.get("/", headers=make_auth_headers("customer@example.com", "wrongpass"))
        self.assertEqual(response.status_code, 401)

    def test_unknown_email_returns_401(self):
        response = self.client.get("/", headers=make_auth_headers("nobody@example.com", "pass123"))
        self.assertEqual(response.status_code, 401)

    def test_no_auth_returns_401(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 401)


class TestGetUser(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        create_group("Модератор")
        org = Organization.objects.create(full_name="Тестовая организация", abbreviated_name="ТестОрг")
        self.moderator = create_user("moder@example.com", "pass123", group_name="Модератор")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик", organization=org)
        self.executor = create_executor("exec@example.com", "pass123")
        self.executor.patronymic = "Иванович"
        self.executor.save()

    def test_moderator_sees_full_profile(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsNotNone(data.get("patronymic"))

    def test_user_sees_own_full_profile(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=make_auth_headers("exec@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.executor.id)
        self.assertIsNotNone(data.get("patronymic"))

    def test_customer_sees_limited_profile_of_another(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=make_auth_headers("cust@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsNone(data.get("patronymic"))
        self.assertIsNone(data.get("organization_id"))

    def test_nonexistent_user_returns_404(self):
        response = self.client.get(
            "/99999/",
            headers=make_auth_headers("moder@example.com", "pass123"),
        )
        self.assertEqual(response.status_code, 404)


class TestGetGroups(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        for name in ("Исполнитель", "Заказчик", "Модератор"):
            create_group(name)
        self.user = create_user("user@example.com", "pass123")

    def test_returns_all_groups(self):
        response = self.client.get("/groups/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        names = [g["name"] for g in data]
        self.assertIn("Исполнитель", names)
        self.assertIn("Заказчик", names)

    def test_no_auth_returns_401(self):
        response = self.client.get("/groups/")
        self.assertEqual(response.status_code, 401)


class TestGetOrganizations(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        self.user = create_user("user@example.com", "pass123")
        Organization.objects.create(full_name="Тест ОАО", abbreviated_name="ТестОАО")
        Organization.objects.create(full_name="Другая ОАО", abbreviated_name="ДругОАО")

    def test_returns_organizations(self):
        response = self.client.get("/organizations/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
        self.assertIn("full_name", data[0])
        self.assertIn("abbreviated_name", data[0])

    def test_no_auth_returns_401(self):
        response = self.client.get("/organizations/")
        self.assertEqual(response.status_code, 401)


class TestGetStudyGroups(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        self.user = create_user("user@example.com", "pass123")
        create_executor("e1@example.com", "pass", study_group="ИТ-21")
        create_executor("e2@example.com", "pass", study_group="ИТ-21")
        create_executor("e3@example.com", "pass", study_group="ИТ-22")

    def test_returns_unique_study_groups(self):
        response = self.client.get("/study_groups/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        groups = [item["study_group"] for item in data]
        self.assertEqual(len(groups), 2)
        self.assertIn("ИТ-21", groups)
        self.assertIn("ИТ-22", groups)

    def test_empty_when_no_executors(self):
        ExecutorData.objects.all().delete()
        response = self.client.get("/study_groups/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


class TestGetBalance(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        create_group("Исполнитель")
        create_group("Заказчик")
        self.executor = create_executor("exec@example.com", "pass123")
        self.customer = create_user("cust@example.com", "pass123", group_name="Заказчик")

    def test_executor_gets_balance(self):
        response = self.client.get("/balance/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("number_of_points", data)
        self.assertIn("executor_id", data)

    def test_balance_auto_created_with_zero(self):
        Balance.objects.filter(executor=self.executor).delete()
        response = self.client.get("/balance/", headers=make_auth_headers("exec@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["number_of_points"], 0)

    def test_customer_cannot_get_balance(self):
        response = self.client.get("/balance/", headers=make_auth_headers("cust@example.com", "pass123"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("баланс", response.json()["detail"].lower())


class TestPostPhoto(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        self.user = create_user("user@example.com", "pass123")

    def _upload(self, filename: str):
        uploaded = SimpleUploadedFile(filename, b"fakeimagecontent", content_type="application/octet-stream")
        return self.client.post(
            "/photo/",
            FILES={"image": uploaded},
            headers=make_auth_headers("user@example.com", "pass123"),
        )

    def test_upload_jpeg_success(self):
        response = self._upload("photo.jpg")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Фото профиля установлено", response.json()["detail"])

    def test_upload_png_success(self):
        response = self._upload("photo.png")
        self.assertEqual(response.status_code, 200)

    def test_upload_gif_rejected(self):
        response = self._upload("photo.gif")
        self.assertEqual(response.status_code, 400)
        self.assertIn("формат", response.json()["detail"].lower())

    def test_upload_pdf_rejected(self):
        response = self._upload("doc.pdf")
        self.assertEqual(response.status_code, 400)


class TestGetRequests(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        self.user = create_user("user@example.com", "pass123")
        self.other = create_user("other@example.com", "pass123")
        Request.objects.create(user=self.user, message="Первое обращение")
        Request.objects.create(user=self.user, message="Второе обращение")
        Request.objects.create(user=self.other, message="Чужое обращение")

    def test_user_sees_only_own_requests(self):
        response = self.client.get("/requests/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        for item in data:
            self.assertNotEqual(item["message"], "Чужое обращение")

    def test_request_status_is_human_readable(self):
        response = self.client.get("/requests/", headers=make_auth_headers("user@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data[0]["request_status"], "На рассмотрении")

    def test_empty_list_when_no_requests(self):
        Request.objects.filter(user=self.other).delete()
        response = self.client.get("/requests/", headers=make_auth_headers("other@example.com", "pass123"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


class TestPostRequest(TestCase):

    def setUp(self):
        self.client = TestClient(router)
        self.user = create_user("user@example.com", "pass123")

    def _post(self, message: str):
        return self.client.post(
            "/request/",
            json={"message": message},
            headers=make_auth_headers("user@example.com", "pass123"),
        )

    def test_create_request_success(self):
        response = self._post("Прошу помочь с задачей")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Обращение создано", response.json()["detail"])

    def test_three_requests_per_day_allowed(self):
        for i in range(3):
            response = self._post(f"Обращение {i + 1}")
            self.assertEqual(response.status_code, 200)

    def test_fourth_request_per_day_rejected(self):
        for i in range(3):
            self._post(f"Обращение {i + 1}")
        response = self._post("Четвёртое обращение")
        self.assertEqual(response.status_code, 400)
        self.assertIn("максимальное", response.json()["detail"].lower())

    def test_empty_message_rejected(self):
        response = self._post("")
        self.assertEqual(response.status_code, 400)
        self.assertIn("пустым", response.json()["detail"].lower())