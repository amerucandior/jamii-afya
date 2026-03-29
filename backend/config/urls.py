from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Schema & Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-view'),

    # App routes
    path('api/auth/', include('users.urls')),
    path('api/groups/', include('groups.urls')),
    path('api/contributions/', include('contributions.urls')),
    path('api/emergencies/',  include('emergencies.urls')),
    path('api/mpesa/', include('mpesa.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/audit/', include('audit.urls')),
]

