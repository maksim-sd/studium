from django.contrib import admin
from .models import Balance, CategoryProduct, Product, Cart, CartProduct, Order, OrderProduct, Chat, ChatMessages, MessageFiles, Tag, Task, TaskTag, Feedback, Response


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ["id", "executor", "number_points",]
    
    
@admin.register(CategoryProduct)
class CategoryProductAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "category_product", "name", "stock", "price", "product_status"]    
    
 
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "executor",]
    

@admin.register(CartProduct)
class CartProductsAdmin(admin.ModelAdmin):
    list_display = ["id", "cart", "product", "quantity",]
 
    
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "executor", "created_at", "total_amount", "order_status",]


@admin.register(OrderProduct)
class OrderProductsAdmin(admin.ModelAdmin):
    list_display = ["order", "product", "quantity", "price",]
    

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "chat_status", "created_at",]
    

@admin.register(ChatMessages)
class ChatMessagesAdmin(admin.ModelAdmin):
    list_display = ["id", "chat", "user", "message", "created_at",]
    
    
@admin.register(MessageFiles)
class MessageFilesAdmin(admin.ModelAdmin):
    list_display = ["id", "chat_message", "file",]
    
    
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    
    
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "moderator", "executor", "task_status", "name", "type_reward", "amount_reward", "deadlines", "created_at", "completed_at", "chat",]
    
    
@admin.register(TaskTag)
class TaskTagsAdmin(admin.ModelAdmin):
    list_display = ["id", "task", "tag",]
    
   
@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ["task", "executor", "comment", "created_at",]
    
     
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["task", "number_stars", "comment", "created_at",]