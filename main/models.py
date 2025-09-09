from django.db import models
from django.contrib.auth.models import User, Group


class Balance(models.Model):
    executor = models.OneToOneField(User, on_delete=models.CASCADE, unique=True, verbose_name="Исполнитель")
    number_points = models.IntegerField(default=0, verbose_name="Количество баллов")
    
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
        ordering = ["name"]
       

class Product(models.Model):
    STATUS_CHOICES = (
        ("A", "Появится в будущем"),
        ("B", "В наличии"),
        ("C", "Отсутсвует")
    )
    category_product = models.ForeignKey(CategoryProduct, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Категория товара")
    name = models.CharField(max_length=40, verbose_name="Название")
    description = models.CharField(max_length=300, null=True, blank=True, verbose_name="Описание")
    stock = models.IntegerField(verbose_name="Запас")
    price = models.IntegerField(verbose_name="Цена")
    photo = models.ImageField(upload_to="images/", null=True, blank=True, verbose_name="Фото")
    product_status = models.CharField(max_length=40, choices=STATUS_CHOICES, verbose_name="Статус товара")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ["name"]
 
 
class Cart(models.Model):
    executor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Исполнитель")
    
    def __str__(self):
        return f"Корзина {self.executor.username}"
    
    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"
        

class CartProduct(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="products", verbose_name="Корзина")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.IntegerField(default=1, verbose_name="Количество")
    
    class Meta:
        verbose_name = "Товары в корзине"
        verbose_name_plural = "Товары в корзинах"
        unique_together = ("cart", "product")
        ordering = ["-id"]
        

class Order(models.Model):
    STATUS_CHOICES = (
        ("A", "Оформлен"),
        ("B", "Получен"),
        ("C", "Отменен")
    )
    executor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Исполнитель")
    total_amount = models.IntegerField(null=True, blank=True, verbose_name="Сумма заказа")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время заказа")
    order_status = models.CharField(max_length=40, default="Оформлен", choices=STATUS_CHOICES, verbose_name="Статус заказа")
    
    def __str__(self):
        return f"Заказ {self.executor.username} | №{self.id}"
    
    def get_total_amount(self):
        return sum(i for i in self.products.all())
    
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ["-created_at"]


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="products", verbose_name="Заказ")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.IntegerField(default=1, verbose_name="Количество")
    price = models.IntegerField(verbose_name="Цена")
    
    def get_amount(self):
        return self.product.price * self.quantity
    
    class Meta:
        verbose_name = "Товар в заказе"
        verbose_name_plural = "Товары в заказах"
        unique_together = ("order", "product")
        ordering = ["-id"]


class Chat(models.Model):
    STATUS_CHOICES = (
        ("A", "Доступен"),
        ("B", "Недоступен")
    )
    chat_status = models.CharField(max_length=40, choices=STATUS_CHOICES, verbose_name="Статус чата")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время создания")
    
    def __str__(self):
        return f"Чат №{self.id}"
    
    class Meta:
        verbose_name = "Чат"
        verbose_name_plural = "Чаты"
        ordering = ["-created_at"]
        

class ChatMessages(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, verbose_name="Чат")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    message = models.CharField( null=True, blank=True, max_length=120, verbose_name="Сообщение")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время сообщения")
    
    def __str__(self):
        return f"Сообщение №{self.id}"
    
    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чатов"
        ordering = ["-created_at"]
  
 
class MessageFiles(models.Model):
    chat_message = models.ForeignKey(ChatMessages, on_delete=models.CASCADE, verbose_name="Сообщение чата")
    file = models.FileField(null=True, blank=True, upload_to="files/", verbose_name="Файл")

    class Meta:
        verbose_name = "Файл в сообщении"
        verbose_name_plural = "Файлы в сообщениях"
        
        
class Tag(models.Model):
    name = models.CharField(max_length=40, verbose_name="Название")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
        ordering = ["name"]


class Task(models.Model):
    STATUS_CHOICES = (
        ("A", "Поиск исполнителя"),
        ("B", "В работе"),
        ("C", "Завершена"),
        ("D", "Отменена")
    )
    TYPE_REWARD_CHOICES = (
        ("A", "Бальное"),
        ("B", "Денежное")
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="customer_set", verbose_name="Заказчик")
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="moderator_set", verbose_name="Модератор")
    executor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="executor_set", verbose_name="Исполнитель")
    task_status = models.CharField(max_length=40, choices=STATUS_CHOICES, verbose_name="Статус задачи")
    name = models.CharField(max_length=40, verbose_name="Название")
    description = models.CharField(max_length=300,verbose_name="Описание")
    type_reward = models.CharField(max_length=40, choices=TYPE_REWARD_CHOICES, verbose_name="Тип вознаграждения")
    amount_reward = models.IntegerField(null=True, blank=True, verbose_name="Сумма вознаграждения")
    deadlines = models.ImageField(verbose_name="Сроки(количество дней)")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время создания")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата и время завершения")
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Чат")
    
    def __str__(self):
        return f"№{self.id} | {self.name}"
    
    class Meta:
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"
        ordering = ["-created_at"]
        
        
class TaskTag(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задача")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, verbose_name="Тег")
    
    class Meta:
        verbose_name = "Теги задачи"
        verbose_name_plural = "Теги задач"
        unique_together = ("task", "tag")
        ordering = ["task__id"]
       
        
class Response(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, verbose_name="Задача")
    executor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Исполнитель")
    comment = models.CharField(max_length=120, null=True, blank=True, verbose_name="Коментарий")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время отклика")
    
    class Meta:
        verbose_name = "Отклик"
        verbose_name_plural = "Отклики"
        unique_together = ("task", "executor")
        ordering = ["-created_at"]
        
        
class Feedback(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, verbose_name="Задача")
    number_stars = models.DecimalField(max_digits=3, decimal_places=2, verbose_name="Количество звезд")
    comment = models.CharField(max_length=120, null=True, blank=True, verbose_name="Коментарий")
    created_at = models.DateTimeField(auto_now=True, verbose_name="Дата и время создания")
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"