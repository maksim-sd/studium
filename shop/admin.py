from django.contrib import admin
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist

from unfold.admin import ModelAdmin

from user.models import CustomUser
from .models import CategoryProduct, Product, Cart, CartProduct, Order, OrderProduct


@admin.register(CategoryProduct)
class CategoryProductAdmin(ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ("id", "name", "category_product", "stock", "price", "product_status")
    list_display_links = ("name",)
    search_fields = ("name",)
    list_filter = ("category_product", "product_status")
 
@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ("id", "executor")
    list_display_links = ("executor",)
    search_fields = ("executor",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    

@admin.register(CartProduct)
class CartProductsAdmin(ModelAdmin):
    list_display = ("id", "cart", "product", "quantity")
    list_display_links = ("cart",)
    search_fields = ("cart", "product")   
 
    
@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ("id", "executor", "created_at", "total_amount", "order_status")
    list_display_links = ("executor",)
    search_fields = ("executor",)
    list_filter = ("order_status",) 

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except:
                kwargs["queryset"] = CustomUser.objects.all()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    

@admin.register(OrderProduct)
class OrderProductsAdmin(ModelAdmin):
    list_display = ("id", "order", "product", "quantity", "price")
    list_display_links = ("order",)
    search_fields = ("order", "product")
    
