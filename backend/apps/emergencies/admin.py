from django.contrib import admin
from .models import EmergencyRequest, EmergencyDocument, EmergencyApproval


class EmergencyDocumentInline(admin.TabularInline):
    model   = EmergencyDocument
    extra   = 0
    fields  = ['label', 'file', 'uploaded_at']
    readonly_fields = ['uploaded_at']


class EmergencyApprovalInline(admin.TabularInline):
    model   = EmergencyApproval
    extra   = 0
    fields  = ['admin', 'decision', 'note', 'voted_at']
    readonly_fields = ['voted_at']


@admin.register(EmergencyRequest)
class EmergencyRequestAdmin(admin.ModelAdmin):
    list_display  = ['claimant', 'group', 'emergency_type', 'amount_requested',
                     'amount_approved', 'status', 'created_at']
    list_filter   = ['status', 'emergency_type', 'group']
    search_fields = ['claimant__phone_number', 'claimant__first_name', 'mpesa_ref']
    readonly_fields = ['mpesa_ref', 'created_at', 'resolved_at']
    inlines       = [EmergencyDocumentInline, EmergencyApprovalInline]


@admin.register(EmergencyApproval)
class EmergencyApprovalAdmin(admin.ModelAdmin):
    list_display  = ['emergency', 'admin', 'decision', 'voted_at']
    list_filter   = ['decision']
    readonly_fields = ['voted_at']
