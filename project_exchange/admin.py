from django.contrib import admin
from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from .models import CategoryProject, Technology, Project, Chat, ChatMessages, MessageFiles, Feedback, Response, ProjectFiles
from profile.models import CustomUser


@admin.register(CategoryProject)
class CategoryProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    list_display_links = ("name",)
    search_fields = ("name",)
    ordering = ("name",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "project_status", "customer", "category_project", "cash_reward", "number_of_points", "due_date", "created_at", "completed_at")
    list_display_links = ("name",)
    filter_horizontal = ("moderators", "executors", "technologies")
    search_fields = ("name",)
    ordering = ("-id",)
    list_filter = ("category_project", "project_status") 

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


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("id", "project")
    list_display_links = ("project",)
    search_fields = ("project",)
    ordering = ("-id",)
    

@admin.register(ChatMessages)
class ChatMessagesAdmin(admin.ModelAdmin):
    list_display = ("id", "chat", "user", "message", "created_at")
    list_display_links = ("chat",)
    search_fields = ("user", "message",)
    ordering = ("-id",)
    
    
    
@admin.register(MessageFiles)
class MessageFilesAdmin(admin.ModelAdmin):
    list_display = ("id", "chat_message", "file")
    list_display_links = ("chat_message",)
    search_fields = ("chat_message",)
    ordering = ("-id",)
    
   
@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
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
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "number_stars", "comment", "created_at")
    list_display_links = ("project",)
    search_fields = ("project", "comment")
    ordering = ("-id",)
    list_filter = ("number_stars",) 

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "project":
            try:
                kwargs["queryset"] = Project.objects.filter(project_status="COMPLETED")
            except:
                kwargs["queryset"] = CustomUser.objects.all()
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(ProjectFiles)
class ProjectFilesAdmin(admin.ModelAdmin):
    list_display = ("id", "project", "file")
    list_display_links = ("project",)
    search_fields = ("project",)
    ordering = ("-id",)