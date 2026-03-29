from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ['user', 'action', 'endpoint', 'response_code', 'ip_address', 'timestamp']
    list_filter   = ['action', 'response_code']
    search_fields = ['user__phone_number', 'endpoint', 'ip_address']
    readonly_fields = ['user', 'action', 'endpoint', 'payload',
                       'response_code', 'ip_address', 'timestamp']

    def has_add_permission(self, request):
        return False   # Audit logs are system-generated only

    def has_delete_permission(self, request, obj=None):
        return False   # Never delete audit logs
