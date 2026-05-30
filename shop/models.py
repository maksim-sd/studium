from django.db import models

from user.models import CustomUser
       

class CategoryProduct(models.Model):
    name = models.CharField(max_length=40, verbose_name="Наименование")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Категория товара"
        verbose_name_plural = "Категории товара"
        ordering = ("name",)
       

class Product(models.Model):
    STATUS_CHOICES = (
        ("FUTURE", "Появится в будущем"),
        ("AVAILABLE", "В наличии"),
        ("UNAVAILABLE", "Отсутствует")
    )
    category_product = models.ForeignKey(
        CategoryProduct,
        on_delete=models.SET_NULL,
        null=True, 
        blank=True, 
        verbose_name="Категория товара"
    )
    name = models.CharField(max_length=40, verbose_name="Наименование")
    description = models.CharField(max_length=300, null=True, blank=True, verbose_name="Описание")
    stock = models.IntegerField(verbose_name="Запас")
    price = models.IntegerField(verbose_name="Цена")
    photo = models.ImageField(upload_to="product_images/", null=True, blank=True, verbose_name="Фото")
    product_status = models.CharField(max_length=30, choices=STATUS_CHOICES, verbose_name="Статус товара")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ("name",)
 
 
class Cart(models.Model):
    executor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Исполнитель")
    
    def __str__(self):
        return f"Корзина - {self.executor}"
    
    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"
        ordering = ("executor",)  
        

class CartProduct(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="products", verbose_name="Корзина")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.IntegerField(default=1, verbose_name="Количество")
    
    def __str__(self):
        return f""

    class Meta:
        verbose_name = "Товары в корзине"
        verbose_name_plural = "Товары в корзине"
        unique_together = ("cart", "product")
        ordering = ("cart", "product") 
        

class Order(models.Model):
    STATUS_CHOICES = (
        ("CREATED", "Оформлен"),
        ("RECEIVED", "Получен"),
        ("CANCELED", "Отменен")
    )
    executor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, verbose_name="Исполнитель")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время заказа")
    order_status = models.CharField(
        max_length=30, 
        default="CREATED", 
        choices=STATUS_CHOICES, 
        verbose_name="Статус заказа"
    )
    
    @property
    def total_amount(self):
        return sum(i.get_amount() for i in self.products.all())
    
    total_amount.fget.short_description = "Сумма заказа"
    
    def __str__(self):
        return f"Заказ №{self.id} - {self.executor}"
    
    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ("-id",)


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="products", verbose_name="Заказ")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.IntegerField(default=1, verbose_name="Количество")
    price = models.IntegerField(verbose_name="Цена")
    
    def get_amount(self):
        return self.price * self.quantity
    
    def __str__(self):
        return f""
    
    class Meta:
        verbose_name = "Товар в заказе"
        verbose_name_plural = "Товары в заказе"
        unique_together = ("order", "product")
        ordering = ("order", "product")