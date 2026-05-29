from django.contrib import admin
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.shortcuts import get_object_or_404
from django import forms

from unfold.admin import ModelAdmin, TabularInline
from user.models import CustomUser, Balance
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
 

class CartProductInline(TabularInline):
    model = CartProduct
    extra = 1
    readonly_fields = ("cart_product_id",)
    fields = ("cart_product_id", "product", "quantity")

    def cart_product_id(self, obj):
        return obj.pk
    
    cart_product_id.short_description = "ID"


@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ("id", "executor")
    list_display_links = ("executor",)
    search_fields = ("executor",)
    inlines = [CartProductInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    

# @admin.register(CartProduct)
# class CartProductsAdmin(ModelAdmin):
#     list_display = ("id", "cart", "product", "quantity")
#     list_display_links = ("cart",)
#     search_fields = ("cart", "product")   
 
    
class OrderProductInline(TabularInline):
    model = OrderProduct
    extra = 1
    readonly_fields = ("order_product_id",)
    fields = ("order_product_id", "product", "quantity", "price")

    def order_product_id(self, obj):
        return obj.pk
    
    order_product_id.short_description = "ID"


class OrderAdminForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()
        if self.instance.pk:
            old = Order.objects.get(pk=self.instance.pk)
            if old.order_status in ("RECEIVED", "CANCELED"):
                raise forms.ValidationError("Невозможно изменить отмененный или полученный заказ")
            if cleaned_data.get("executor") != old.executor:
                raise forms.ValidationError("Невозможно поменять пользователя заказа")
        return cleaned_data


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    form = OrderAdminForm
    list_display = ("id", "executor", "created_at", "total_amount", "order_status")
    list_display_links = ("executor",)
    search_fields = ("executor",)
    list_filter = ("order_status",) 
    inlines = [OrderProductInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except:
                kwargs["queryset"] = CustomUser.objects.all()

        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        if change:
            old = Order.objects.get(id=obj.id)
            
            if old.order_status != obj.order_status:
                if obj.order_status == "CANCELED":
                    with transaction.atomic():
                        order_products = OrderProduct.objects.filter(order=obj)
                        total_amount = sum(i.price * i.quantity for i in order_products)
                        balance = get_object_or_404(Balance, executor=obj.executor)
                        balance.number_of_points += total_amount
                        balance.save()
                        for order_product in order_products:
                            order_product.product.stock += order_product.quantity
                            order_product.product.save()

        super().save_model(request, obj, form, change)

# @admin.register(OrderProduct)
# class OrderProductsAdmin(ModelAdmin):
#     list_display = ("id", "order", "product", "quantity", "price")
#     list_display_links = ("order",)
#     search_fields = ("order", "product")
    
