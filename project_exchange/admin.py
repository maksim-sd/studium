from django.contrib import admin
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Case, IntegerField, When
from django.utils.html import mark_safe

from unfold.admin import ModelAdmin, TabularInline

from .models import CategoryProject, Technology, Project, Chat, ChatMessages, MessageFiles, Feedback, Response, ProjectFiles, ChatUsers
from user.models import CustomUser


@admin.register(CategoryProject)
class CategoryProjectAdmin(ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    search_fields = ("name",)


@admin.register(Technology)
class TechnologyAdmin(ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    search_fields = ("name",)


class ProjectFilesInline(TabularInline):
    model = ProjectFiles
    extra = 1
    readonly_fields = ("project_file_id",)
    fields = ("project_file_id", "file")

    def project_file_id(self, obj):
        return obj.pk
    
    project_file_id.short_description = "ID"


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ("id", "name", "project_status", "category_project", "cash_reward", "created_at")
    list_display_links = ("name",)
    filter_horizontal = ("moderators", "executors", "technologies")
    search_fields = ("name",)
    list_filter = ("category_project", "project_status")
    inlines = [ProjectFilesInline]

    STATUS_ORDER = (
        "IN_PROGRESS",
        "LOOKING_FOR_EXECUTOR",
        "UNDER_INSPECTION",
        "COMPLETED",
        "CANCELED",
    )    

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            status_order=Case(
                *[When(project_status=j, then=i) for i, j in enumerate(self.STATUS_ORDER)],
                default=len(self.STATUS_ORDER),
                output_field=IntegerField()
            )
        ).order_by("status_order", "-created_at") 

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "customer":
            try:
                customer_group = Group.objects.get(name="Заказчик")
                kwargs["queryset"] = CustomUser.objects.filter(groups=customer_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        try:
            moderator_group = Group.objects.get(name="Модератор")
            form.base_fields["moderators"].queryset = CustomUser.objects.filter(groups=moderator_group)
            
            executor_group = Group.objects.get(name="Исполнитель")
            form.base_fields["executors"].queryset = CustomUser.objects.filter(groups=executor_group)
            
            
        except ObjectDoesNotExist as e:
            all_users = CustomUser.objects.all()
            
            if "moderators" in form.base_fields:
                form.base_fields["moderators"].queryset = all_users
            if "executors" in form.base_fields:
                form.base_fields["executors"].queryset = all_users
        
        return form


class ChatUsersInline(TabularInline):
    model = ChatUsers
    extra = 0
    can_delete = False
    max_num = 0
    readonly_fields = ("chat_user_id", "user", "last_read_message_id")
    fields = ("chat_user_id", "user", "last_read_message_id")

    def chat_user_id(self, obj):
        return obj.pk
    
    chat_user_id.short_description = "ID"

    def has_add_permission(self, request, obj=None):
        return False


class ChatMessagesInline(TabularInline):
    model = ChatMessages
    extra = 0
    can_delete = False
    max_num = 0
    readonly_fields = ("message_id", "user", "message", "created_at", "changed", "files_list")
    fields = ("message_id", "user", "message", "created_at", "changed", "files_list")
    

    def has_add_permission(self, request, obj=None):
        return False

    def message_id(self, obj):
        return obj.pk
    
    message_id.short_description = "ID"
    

    def files_list(self, obj):
        files = obj.files.all()
        if not files:
            return "—"
        links = []
        for f in files:
            name = f.file.name.split("/")[-1]
            links.append(f'<a href="{f.file.url}" target="_blank">{name}</a>')
        return mark_safe("<br>".join(links))
    files_list.short_description = "Файлы"


@admin.register(Chat)
class ChatAdmin(ModelAdmin):
    list_display = ("id", "project")
    list_display_links = ("project",)
    search_fields = ("project",)
    inlines = [ChatUsersInline, ChatMessagesInline]
    

# @admin.register(ChatMessages)
# class ChatMessagesAdmin(ModelAdmin):
#     list_display = ("id", "chat", "user", "message", "created_at")
#     list_display_links = ("chat",)
#     search_fields = ("user", "message",)
    
    
# @admin.register(MessageFiles)
# class MessageFilesAdmin(ModelAdmin):
#     list_display = ("id", "chat_message", "file")
#     list_display_links = ("chat_message",)
#     search_fields = ("chat_message",)
    
   
@admin.register(Response)
class ResponseAdmin(ModelAdmin):
    list_display = ("id", "project", "executor", "comment", "created_at")
    list_display_links = ("project",)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "project":
            try:
                kwargs["queryset"] = Project.objects.filter(project_status="LOOKING_FOR_EXECUTOR")
            except:
                kwargs["queryset"] = CustomUser.objects.all()

        elif db_field.name == "executor":
            try:
                executor_group = Group.objects.get(name="Исполнитель")
                kwargs["queryset"] = CustomUser.objects.filter(groups=executor_group)
            except ObjectDoesNotExist:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
     
@admin.register(Feedback)
class FeedbackAdmin(ModelAdmin):
    list_display = ("id", "project", "number_stars", "comment", "created_at")
    list_display_links = ("project",)
    search_fields = ("project", "comment")
    list_filter = ("number_stars",) 

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "project":
            try:
                kwargs["queryset"] = Project.objects.filter(project_status="COMPLETED")
            except:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


# @admin.register(ProjectFiles)
# class ProjectFilesAdmin(ModelAdmin):
#     list_display = ("id", "project", "file")
#     list_display_links = ("project",)
#     search_fields = ("project",)


# @admin.register(ChatUsers)
# class ChatUsersAdmin(ModelAdmin):
#     list_display = ("id", "chat", "user", "last_read_message_id")
#     list_display_links = ("chat",)
#     search_fields = ("user",)