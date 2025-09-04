from django.urls import path
from .api import api
from . import views


urlpatterns = [
    path('api/', api.urls),
]