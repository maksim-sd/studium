from django.contrib import admin
from .models import Balance, CategoryProduct, ProductStatus, Product, PurchaseStatus, Purchase, ChatStatus, Chat, ChatMessages,  TaskStatus, TypeReward, Tag, Task, TaskTag, Feedback, Response


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ["id", "executor", "number_points",]
    
    
@admin.register(CategoryProduct)
class CategoryProductAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]

@admin.register(ProductStatus)
class ProductStatusAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "category_product", "name", "price", "product_status"]
    

@admin.register(PurchaseStatus)
class PurchaseStatusAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    
    
@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ["id", "executor", "product", "price", "purchase_status",]


@admin.register(ChatStatus)
class ChatStatusAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    

@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "chat_status", "datetime_creation",]
    

@admin.register(ChatMessages)
class ChatMessagesAdmin(admin.ModelAdmin):
    list_display = ["id", "chat", "user", "message", "datetime_message",]
    
    
@admin.register(TaskStatus)
class TaskStatusAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    
    
@admin.register(TypeReward)
class TypeRewardAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    
    
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["id", "name",]
    
    
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "moderator", "executor", "task_status", "name", "type_reward", "amount_reward", "deadlines", "datetime_creation", "datetime_completion", "chat",]
    
    
@admin.register(TaskTag)
class TaskTagsAdmin(admin.ModelAdmin):
    list_display = ["id", "task", "tag",]
    
    
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ["task", "number_stars", "comment",]
    
    
@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ["task", "executor", "comment",]