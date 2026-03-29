from django.contrib import admin
from .models import Contribution


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display  = ['member', 'group', 'amount', 'period', 'status', 'mpesa_ref', 'created_at']
    list_filter   = ['status', 'group', 'period']
    search_fields = ['member__phone_number', 'mpesa_ref']
    readonly_fields = ['mpesa_ref', 'confirmed_at', 'created_at']
