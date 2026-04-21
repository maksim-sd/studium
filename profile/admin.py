from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import Balance, Organization, ExecutorData, CustomUser, UserGroups, Request


admin.site.unregister(Group)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "abbreviated_name")
    list_display_links = ("full_name",)
    search_fields = ("full_name", "abbreviated_name")
    ordering = ("full_name",)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    form = UserChangeForm
    
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Личная информация", {
            "fields": ("photo", "last_name", "first_name", "patronymic")
        }),
        ("Организация", {
            "fields": ("organization",)
        }),
        ("Права доступа", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
            ),
        }),
        ("Важные даты", {
            "fields": ("last_login", "date_joined")
        }),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "last_name", "first_name", "patronymic", "password1", "password2"),
        }),
    )
    
    list_display = ("id", "email", "last_name", "first_name", "patronymic", "organization")
    list_display_links = ("email",)
    list_filter = ("groups", "organization")
    search_fields = ("email", "last_name", "first_name", "patronymic")
    ordering = ("last_name",)
    filter_horizontal = ("groups",)
    
    readonly_fields = ("last_login", "date_joined")


@admin.register(UserGroups)
class UserGroupsAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    filter_horizontal = ('permissions',) 
    fieldsets = (
        (None, {'fields': ('name',)}),
        (None, {
            'fields': ('permissions',)
        }),
    )
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(ExecutorData)
class ExecutorDataAdmin(admin.ModelAdmin):
    list_display = ("id", "executor", "faculty", "speciality", "study_group")
    list_display_links = ("executor",)
    search_fields = ("executor",)
    ordering = ("executor",)
    list_filter = ("faculty", "speciality", "study_group")

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ("id", "executor", "number_of_points")
    list_display_links = ("executor",)
    search_fields = ("executor",)
    ordering = ("executor",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "request_status", "created_at")
    list_display_links = ("user",)
    search_fields = ("user", "message")
    list_filter = ("request_status",)