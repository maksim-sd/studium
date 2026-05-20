from datetime import date
import base64

from django.test import TestCase
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from ninja.testing import TestClient

from .models import CustomUser, Organization, ExecutorData, Balance, Request
from .router import router, CUSTOMER, MODERATOR, EXECUTOR, MAX_REQUEST_IN_DAY


class CustomTestCase(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        
        self.customer_group, _ = Group.objects.get_or_create(name=CUSTOMER)
        self.moderator_group, _ = Group.objects.get_or_create(name=MODERATOR)
        self.executor_group, _ = Group.objects.get_or_create(name=EXECUTOR)
        
        self.organization = Organization.objects.create(
            full_name="Тестовая организация",
            abbreviated_name="ТО"
        )
        
        self.customer = CustomUser.objects.create_user(
            email="customer@test.com",
            password="testpass123",
            last_name="Customerov",
            first_name="Customer",
            patronymic="Customerovich",
            organization=self.organization
        )
        self.customer.groups.add(self.customer_group)
        
        self.moderator = CustomUser.objects.create_user(
            email="moderator@test.com",
            password="testpass123",
            last_name="Moderatorov",
            first_name="Moderator"
        )
        self.moderator.groups.add(self.moderator_group)
        
        self.executor = CustomUser.objects.create_user(
            email="executor@test.com",
            password="testpass123",
            last_name="Executorov",
            first_name="Executor",
            patronymic="Executorovich"
        )
        self.executor.groups.add(self.executor_group)
        
        self.executor_data = ExecutorData.objects.create(
            executor=self.executor,
            faculty="Факультет тестирования",
            specialty="Тестирование ПО",
            study_group="TEST-01"
        )

    def _auth_headers(self, email, password):
        credentials = base64.b64encode(f"{email}:{password}".encode()).decode()
        return {"Authorization": f"Basic {credentials}"}
        

class userTest(CustomTestCase):
    def setUp(self):
        super().setUp()
        self.balance = Balance.objects.create(
            executor=self.executor,
            number_of_points=100
        )
    
    def test_get_current_user_customer(self):
        response = self.client.get(
            "/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.customer.id)
        self.assertEqual(data["last_name"], "Customerov")
        self.assertEqual(data["first_name"], "Customer")
        self.assertEqual(data["organization_id"], self.organization.id)
        self.assertEqual(data["patronymic"], "Customerovich")
        self.assertEqual(data["groups_id"], [self.customer_group.id])
        self.assertIsNone(data.get("faculty"))
        self.assertIsNone(data.get("specialty"))
        self.assertIsNone(data.get("study_group"))
    
    def test_get_current_user_executor(self):
        response = self.client.get(
            "/",
            headers=self._auth_headers("executor@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.executor.id)
        self.assertEqual(data["faculty"], "Факультет тестирования")
        self.assertEqual(data["specialty"], "Тестирование ПО")
        self.assertEqual(data["study_group"], "TEST-01")
        self.assertEqual(data["average_rating"], 0)
    
    def test_get_other_user_user_as_customer(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.executor.id)
        self.assertEqual(data["last_name"], "Executorov")
        self.assertEqual(data["first_name"], "Executor")
        self.assertEqual(data["groups_id"], [self.executor_group.id])
        
        self.assertIsNone(data.get("organization_id"))
        self.assertIsNone(data.get("patronymic"))
        self.assertIsNone(data.get("faculty"))
        self.assertIsNone(data.get("specialty"))
        self.assertIsNone(data.get("study_group"))
        self.assertIsNone(data.get("average_rating"))
    
    def test_get_user_as_moderator_full_data(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=self._auth_headers("moderator@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["id"], self.executor.id)
        self.assertEqual(data["organization_id"], None)
        self.assertEqual(data["last_name"], "Executorov")
        self.assertEqual(data["first_name"], "Executor")
        self.assertEqual(data["patronymic"], "Executorovich")
        self.assertEqual(data["faculty"], "Факультет тестирования")
        self.assertEqual(data["specialty"], "Тестирование ПО")
        self.assertEqual(data["study_group"], "TEST-01")
        self.assertEqual(data["average_rating"], 0)
    
    def test_get_nonexistent_user_returns_404(self):
        response = self.client.get(
            "/99999/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_get_groups_list(self):
        response = self.client.get(
            "/groups/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIsInstance(data, list)
        group_names = [g["name"] for g in data]
        self.assertIn(CUSTOMER, group_names)
        self.assertIn(MODERATOR, group_names)
        self.assertIn(EXECUTOR, group_names)
    
    def test_get_organizations_list(self):
        response = self.client.get(
            "/organizations/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], self.organization.id)
        self.assertEqual(data[0]["full_name"], "Тестовая организация")
        self.assertEqual(data[0]["abbreviated_name"], "ТО")
    
    def test_get_balance_as_executor(self):
        response = self.client.get(
            "/balance/",
            headers=self._auth_headers("executor@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["executor_id"], self.executor.id)
        self.assertEqual(data["number_of_points"], 100)
        self.assertIn("id", data)
    
    def test_get_balance_auto_create(self):
        new_executor = CustomUser.objects.create_user(
            email="new_executor@test.com",
            password="testpass123",
            last_name="New",
            first_name="Executor"
        )
        new_executor.groups.add(self.executor_group)
        
        response = self.client.get(
            "/balance/",
            headers=self._auth_headers("new_executor@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["number_of_points"], 0)
        
        self.assertTrue(Balance.objects.filter(executor=new_executor).exists())
    
    def test_get_balance_as_customer_returns_400(self):
        response = self.client.get(
            "/balance/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Данный пользователь не может иметь баланс", str(data))

    def test_post_photo_valid_format(self):
        image_content = b"fake-image-content"
        uploaded_file = SimpleUploadedFile(
            "user.jpg",
            image_content,
            content_type="image/jpeg"
        )
        
        response = self.client.post(
            "/photo/",
            FILES={"image": uploaded_file},
            headers=self._auth_headers("customer@test.com", "testpass123")
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["detail"], "Фото профиля установлено")
        
        self.customer.refresh_from_db()
        self.assertIsNotNone(self.customer.photo)
        self.assertTrue(self.customer.photo.name.endswith(".jpg"))
    
    def test_post_photo_invalid_format_returns_400(self):
        image_content = b"fake-gif-content"
        uploaded_file = SimpleUploadedFile(
            "user.gif",
            image_content,
            content_type="image/gif"
        )
        
        response = self.client.post(
            "/photo/",
            FILES={"image": uploaded_file},
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Недопустимый формат изображения", str(data))
    
    def test_get_requests_list(self):
        request1 = Request.objects.create(
            user=self.customer,
            message="Проблема с профилем",
            request_status="UNDER_CONSIDERATION"
        )
        request2 = Request.objects.create(
            user=self.customer,
            message="Вопрос по проекту",
            request_status="REVIEWED",
            answer="Ответ на вопрос"
        )
        
        response = self.client.get(
            "/requests/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 2)
        
        statuses = [r["request_status"] for r in data]
        self.assertIn("На рассмотрении", statuses)
        self.assertIn("Рассмотрено", statuses)
        
        reviewed_request = next(r for r in data if r["request_status"] == "Рассмотрено")
        self.assertEqual(reviewed_request["answer"], "Ответ на вопрос")
    
    def test_post_request_within_limit(self):
        response = self.client.post(
            "/request/",
            json={"message": "Тестовое обращение"},
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["detail"], "Обращение создано")
        
        request_obj = Request.objects.filter(user=self.customer).first()
        self.assertIsNotNone(request_obj)
        self.assertEqual(request_obj.message, "Тестовое обращение")
        self.assertEqual(request_obj.request_status, "UNDER_CONSIDERATION")
        self.assertIsNone(request_obj.answer)
    
    def test_post_request_exceeds_limit_returns_400(self):
        today = timezone.now().date()
        
        for i in range(MAX_REQUEST_IN_DAY):
            Request.objects.create(
                user=self.customer,
                message=f"Обращение {i}",
                created_at=timezone.make_aware(
                    timezone.datetime.combine(today, timezone.datetime.min.time())
                )
            )
        
        response = self.client.post(
            "/request/",
            json={"message": "Превышающее обращение"},
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Превышено максимальное количество обращений за день", str(data))
        
        self.assertEqual(Request.objects.filter(user=self.customer).count(), MAX_REQUEST_IN_DAY)
    
    def test_endpoints_require_authentication(self):
        endpoints = ["/", "/groups/", "/organizations/", "/balance/", "/requests/"]
        
        for endpoint in endpoints:
            response = self.client.get(endpoint, headers={})
            self.assertEqual(response.status_code, 401, f"Failed for {endpoint}")
        
        response = self.client.post("/photo/", files={}, headers={})
        self.assertEqual(response.status_code, 401)
        
        response = self.client.post("/request/", json={}, headers={})
        self.assertEqual(response.status_code, 401)
    
    def test_invalid_credentials_returns_401(self):
        response = self.client.get(
            "/",
            headers=self._auth_headers("wrong@test.com", "wrongpass")
        )
        self.assertEqual(response.status_code, 401)
    
    def test_get_own_user_as_executor_shows_full_data(self):
        response = self.client.get(
            f"/{self.executor.id}/",
            headers=self._auth_headers("executor@test.com", "testpass123")
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["patronymic"], "Executorovich")
        self.assertEqual(data["faculty"], "Факультет тестирования")
        self.assertEqual(data["specialty"], "Тестирование ПО")
        self.assertEqual(data["study_group"], "TEST-01")
    
    def test_post_photo_without_file_returns_error(self):
        response = self.client.post(
            "/photo/",
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        self.assertNotEqual(response.status_code, 200)
    
    def test_post_request_empty_message(self):
        response = self.client.post(
            "/request/",
            json={"message": ""},
            headers=self._auth_headers("customer@test.com", "testpass123")
        )
        data = response.json()

        self.assertEqual(response.status_code, 400)
        self.assertIn("Сообщение не может быть пустым", str(data))