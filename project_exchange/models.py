from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Case, IntegerField, Max, When


from user.models import CustomUser


class CategoryProject(models.Model):
    name = models.CharField(max_length=60, verbose_name="Наименование")
    icon = models.ImageField(upload_to="category_project_icon/", null=True, blank=True, verbose_name="Иконка")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Категория проекта"
        verbose_name_plural = "Категории проекта"
        ordering = ("name",)


class Technology(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Технология"
        verbose_name_plural = "Технологии"
        ordering = ("name",)


class ProjectManager(models.Manager):
    STATUS_ORDER = (
        "IN_PROGRESS",
        "LOOKING_FOR_EXECUTOR",
        "UNDER_INSPECTION",
        "COMPLETED",
        "CANCELED",
    )

    def ordered_by_status(self):
        return self.annotate(
            status_order=Case(
                *[When(project_status=j, then=i) for i, j in enumerate(self.STATUS_ORDER)],
                default=len(self.STATUS_ORDER),
                output_field=IntegerField()
            )
        ).order_by("status_order", "-created_at")


class Project(models.Model):
    objects = ProjectManager()

    NUMBER_OF_POINTS_FEEDBACK = {
        4: 15,
        5: 30
    }
    
    STATUS_CHOICES = (
        ("UNDER_INSPECTION", "На проверке"),
        ("LOOKING_FOR_EXECUTOR", "Поиск исполнителя"),
        ("IN_PROGRESS", "В работе"),
        ("COMPLETED", "Завершен"),
        ("CANCELED", "Отменен")
    )

    NUMBER_OF_POINTS_CHOICES = (
        (50 , 50),
        (125, 125),
        (200, 200)
    )

    PROJECT_TYPE = (
        "Маленький", 
        "Средний", 
        "Большой"
    )

    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="customer_projects", verbose_name="Заказчик")
    moderators = models.ManyToManyField(CustomUser, blank=True, related_name="moderator_projects", verbose_name="Модераторы")
    executors = models.ManyToManyField(CustomUser, blank=True, related_name="executor_projects", verbose_name="Исполнители")
    project_status = models.CharField(max_length=30, default="UNDER_INSPECTION", choices=STATUS_CHOICES, verbose_name="Статус проекта")
    category_project = models.ForeignKey(CategoryProject, null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Категория проекта")
    custom_category_project = models.CharField(max_length=60, null=True, blank=True, verbose_name="Другая категория проекта")
    technologies = models.ManyToManyField(Technology, blank=True, related_name="technology_projects", verbose_name="Технологии")
    custom_technologies = models.TextField(null=True, blank=True, verbose_name="Другие технологии")
    name = models.CharField(max_length=120, verbose_name="Наименование")
    description = models.TextField(verbose_name="Описание")
    cash_reward = models.BooleanField(default=False, verbose_name="Денежное вознаграждение")
    number_of_points = models.IntegerField(default=50, choices=NUMBER_OF_POINTS_CHOICES, verbose_name="Количество баллов")
    due_date = models.DateField(verbose_name="Дата сдачи")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время создания")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата и время завершения")
    
    def __str__(self):
        return f"Проект №{self.id} {self.name}"
    
    class Meta:
        verbose_name = "Проект"
        verbose_name_plural = "Проекты"


class ChatManager(models.Manager):
    def ordered_by_last_message(self):
        return self.annotate(
            last_message_at=Max('messages__created_at')
        ).order_by('-last_message_at')


class Chat(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="chats", verbose_name="Проект")

    objects = ChatManager()
    
    def __str__(self):
        return f"Чат №{self.id} - {self.project}"
    
    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"
        ordering = ("-id",)
        

class ChatMessages(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages", verbose_name="Чат")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Пользователь")
    message = models.TextField( null=True, blank=True, verbose_name="Сообщение")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время сообщения")
    changed = models.BooleanField(default=False, verbose_name="Изменено")
    
    def __str__(self):
        return f""
    
    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
        ordering = ("-id",)
  
 
class MessageFiles(models.Model):
    chat_message = models.ForeignKey(ChatMessages, on_delete=models.CASCADE, related_name="files", verbose_name="Сообщение чата")
    file = models.FileField(upload_to="chat_files/", verbose_name="Файл")


    class Meta:
        verbose_name = "Файл в сообщении"
        verbose_name_plural = "Файлы в сообщении"
        ordering = ("-id",)
        
        
class Response(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, verbose_name="Проект")
    executor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="executor_responses", verbose_name="Исполнитель")
    comment = models.TextField(null=True, blank=True, verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время отклика")

    def __str__(self):
        return f"{self.project} - {self.executor}: {self.comment}"

    class Meta:
        verbose_name = "Отклик"
        verbose_name_plural = "Отклики"
        unique_together = ("project", "executor")
        ordering = ("-id",)
        
        
class Feedback(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, verbose_name="Проект")
    number_stars = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name="Количество звезд")
    comment = models.TextField(null=True, blank=True, verbose_name="Комментарий")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время создания")
    
    def __str__(self):
        return f"{self.project} - количество звезд: {self.number_stars}"

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ("-id",)


class ProjectFiles(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="files", verbose_name="Проект")
    file = models.FileField(upload_to="project_files/", verbose_name="Файл")

    class Meta:
        verbose_name = "Файлы проекта"
        verbose_name_plural = "Файлы проекта"
        ordering = ("-id",)


class ChatUsers(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name="Чат")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Пользователь")
    last_read_message_id = models.IntegerField(default=0, verbose_name="ID последнего прочитанного сообщение")

    def __str__(self):
        return f""

    class Meta:
        verbose_name = "Пользователь чата"
        verbose_name_plural = "Пользователи чата"
        unique_together = ("chat", "user")
        ordering = ("-id",)