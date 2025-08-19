from django.db import models
from django.contrib.auth.models import User


class Balance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, unique=True, verbose_name="Студент")
    number_points = models.IntegerField(verbose_name="Количество баллов")
    
    class Meta:
        verbose_name = "Баланс"
        verbose_name_plural = "Балансы"
        

class CategoryProduct(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Категория товара"
        verbose_name_plural = "Категории товара"
        

class Product(models.Model):
    category_product = models.ForeignKey(CategoryProduct, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Категория товара")
    name = models.CharField(max_length=40, verbose_name="Название")
    description = models.CharField(max_length=300, null=True, blank=True, verbose_name="Описание")
    price = models.IntegerField(verbose_name="Цена")
    photo = models.ImageField(null=True, blank=True, verbose_name="Фото")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        

class PurchaseStatus(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Статус покупки"
        verbose_name_plural = "Статусы покупки"
        

class Purchase(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Студент")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    price = models.IntegerField(verbose_name="Цена")
    purchase_status = models.ForeignKey(PurchaseStatus, on_delete=models.CASCADE, verbose_name="Статус покупки")
    
    class Meta:
        verbose_name = "Покупка"
        verbose_name_plural = "Покупки"


class ChatStatus(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Статус чата"
        verbose_name_plural = "Статусы чата"
        

class Chat(models.Model):
    chat_status = models.ForeignKey(ChatStatus, on_delete=models.CASCADE, verbose_name="Статус чата")
    datetime_creation = models.DateTimeField(auto_now=True, verbose_name="Дата и время создания")
    
    def __str__(self):
        return self.id
    
    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"
        

class ChatMessages(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name="Чат")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    message = models.CharField(max_length=120, verbose_name="Сообщение")
    datetime_message = models.DateTimeField(auto_now=True, verbose_name="Дата и время сообщения")
    
    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чатов"
        

class TaskStatus(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Статус задачи"
        verbose_name_plural = "Статусы задачи"
        
        
class TypeReward(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Тип вознаграждения"
        verbose_name_plural = "Типы вознаграждения"
        
        
class Tag(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"


class Task(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="customer_set", verbose_name="Заказчик")
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="moderator_set", verbose_name="Модератор")
    executor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="executor_set", verbose_name="Исполнитель")
    task_status = models.ForeignKey(TaskStatus, on_delete=models.CASCADE, verbose_name="Статус задачи")
    name = models.CharField(max_length=40, verbose_name="Название")
    description = models.CharField(max_length=300,verbose_name="Описание")
    type_reward = models.ForeignKey(TypeReward, on_delete=models.CASCADE, verbose_name="Тип вознаграждения")
    amount_reward = models.IntegerField(null=True, blank=True, verbose_name="Сумма вознаграждения")
    deadlines = models.ImageField(verbose_name="Сроки(количество дней)")
    datetime_creation = models.DateTimeField(auto_now=True, verbose_name="Дата и время создания")
    datetime_completion = models.DateTimeField(null=True, blank=True, verbose_name="Дата и время завершения")
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Чат")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
        
        
class TaskTags(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задача")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, verbose_name="Тег")
    
    class Meta:
        verbose_name = "Теги задачи"
        verbose_name_plural = "Теги задач"
        

class Feedback(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задача")
    number_stars = models.IntegerField(verbose_name="Количество звезд")
    comment = models.CharField(max_length=120, null=True, blank=True, verbose_name="Коментарий")
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"