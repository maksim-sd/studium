from django.contrib import admin
from django.urls import path, include
from .api import api


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls)
]


from django.conf import settings

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns