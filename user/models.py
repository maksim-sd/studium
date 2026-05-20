from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group


class Organization(models.Model):
    full_name = models.CharField(max_length=80, verbose_name="Полное наименование")
    abbreviated_name = models.CharField(max_length=40, verbose_name="Сокращенное наименование")

    def __str__(self):
        return self.abbreviated_name

    class Meta:
        verbose_name = "Организация"
        verbose_name_plural = "Организации"
        ordering = ("full_name",)


class UserGroups(Group):
    def __str__(self):
        return self.name

    class Meta:
        proxy = True
        verbose_name = "Группа"
        verbose_name_plural = "Группы"
        ordering = ("name",)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        
        extra_fields.setdefault('is_active', True)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True) 
    organization = models.ForeignKey(Organization, blank=True, null=True, on_delete=models.CASCADE, verbose_name="Организация")
    last_name = models.CharField(max_length=40, verbose_name="Фамилия")
    first_name = models.CharField(max_length=40, verbose_name="Имя")
    patronymic = models.CharField(max_length=80, blank=True, null=True, verbose_name="Отчество")
    photo = models.ImageField(upload_to="user_photos/", null=True, blank=True, verbose_name="Фото")
    
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ("last_name", "first_name")


class ExecutorData(models.Model):
    executor = models.OneToOneField(CustomUser, on_delete=models.CASCADE, verbose_name="Исполнитель")
    faculty = models.CharField(max_length=60, verbose_name="Факультет")
    specialty = models.CharField(max_length=60, verbose_name="Специальность")
    study_group = models.CharField(max_length=60, verbose_name="Учебная группа")

    def __str__(self):
        return f"{self.executor} {self.study_group}"

    class Meta:
        verbose_name = "Данные исполнителя"
        verbose_name_plural = "Данные исполнителей"
        ordering = ("executor",)


class Balance(models.Model):
    executor = models.OneToOneField(CustomUser, on_delete=models.CASCADE, verbose_name="Исполнитель")
    number_of_points = models.IntegerField(default=0, verbose_name="Количество баллов")
    
    def __str__(self):
        return f"{self.executor} {self.number_of_points} баллов"

    class Meta:
        verbose_name = "Баланс"
        verbose_name_plural = "Балансы"
        ordering = ("executor",)


class Request(models.Model):
    STATUS_REQUEST= (
        ("UNDER_CONSIDERATION", "На рассмотрении"),
        ("REVIEWED", "Рассмотрено"),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Пользователь")
    message = models.TextField(verbose_name="Сообщение")
    request_status = models.CharField(max_length=30, default="UNDER_CONSIDERATION", choices=STATUS_REQUEST, verbose_name="Статус обращения")
    answer = models.TextField(blank=True, null=True, verbose_name="Ответ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время создания")

    def __str__(self):
        return f"{self.user} обращение №{self.id}"
    
    class Meta:
        verbose_name = "Обращение"
        verbose_name_plural = "Обращения"
        ordering = ("-id",)