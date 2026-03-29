from django.contrib import admin
from .models import Notification, SMSLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display   = ['recipient', 'event_type', 'channel', 'title', 'is_read', 'created_at']
    list_filter    = ['event_type', 'is_read', 'channel']
    search_fields  = ['recipient__phone_number', 'title']
    readonly_fields = ['created_at']


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display   = ['recipient_phone', 'status', 'at_message_id',
                      'at_cost', 'at_status_code', 'sent_at']
    list_filter    = ['status']
    search_fields  = ['recipient_phone', 'at_message_id']
    readonly_fields = ['notification', 'recipient_phone', 'message', 'status',
                       'at_message_id', 'at_cost', 'at_status_code',
                       'raw_response', 'sent_at']

    def has_add_permission(self, request):
        return False  # SMS logs are system-generated

    def has_delete_permission(self, request, obj=None):
        return False  # Never delete SMS logs
