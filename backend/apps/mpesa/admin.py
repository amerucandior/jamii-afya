from django.contrib import admin
from .models import MpesaTransaction


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display   = ['user', 'tx_type', 'phone', 'amount', 'status',
                      'mpesa_receipt', 'created_at']
    list_filter    = ['tx_type', 'status']
    search_fields  = ['phone', 'mpesa_receipt', 'checkout_request_id']
    readonly_fields = ['raw_callback', 'created_at', 'updated_at']
