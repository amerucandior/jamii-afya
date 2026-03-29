import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import MpesaTransaction

logger = logging.getLogger(__name__)


class STKCallbackView(APIView):
    """
    Safaricom POSTs here after STK Push completes.
    Confirms the contribution on success.
    """
    permission_classes = [AllowAny]  # Safaricom has no auth header; validate via receipt lookup

    def post(self, request):
        data     = request.data
        callback = data.get('Body', {}).get('stkCallback', {})
        checkout_id = callback.get('CheckoutRequestID', '')
        result_code = str(callback.get('ResultCode', ''))

        try:
            tx = MpesaTransaction.objects.get(checkout_request_id=checkout_id)
        except MpesaTransaction.DoesNotExist:
            logger.warning(f"STK callback for unknown CheckoutRequestID: {checkout_id}")
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        tx.result_code   = result_code
        tx.result_desc   = callback.get('ResultDesc', '')
        tx.raw_callback  = data

        if result_code == '0':
            items = {
                i['Name']: i.get('Value')
                for i in callback.get('CallbackMetadata', {}).get('Item', [])
            }
            tx.mpesa_receipt = items.get('MpesaReceiptNumber', '')
            tx.status        = 'success'
            tx.save()

            # Confirm the pending contribution
            from apps.contributions.models import Contribution
            contribution_qs = Contribution.objects.filter(
                mpesa_ref__isnull=True,
                member=tx.user,
                status='pending',
            ).order_by('-created_at')
            contribution = contribution_qs.first()
            contribution_qs.update(
                status='confirmed',
                mpesa_ref=tx.mpesa_receipt,
                confirmed_at=timezone.now()
            )
            # SMS confirmation to contributor
            if contribution:
                from apps.notifications.tasks import notify_contribution_confirmed
                notify_contribution_confirmed.delay(contribution.id)
        else:
            tx.status = 'failed'
            tx.save()

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class B2CResultView(APIView):
    """
    Safaricom POSTs B2C result here.
    Marks emergency as PAID or FAILED.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data   = request.data
        result = data.get('Result', {})
        conv_id     = result.get('ConversationID', '')
        result_code = str(result.get('ResultCode', ''))

        try:
            tx = MpesaTransaction.objects.get(checkout_request_id=conv_id)
        except MpesaTransaction.DoesNotExist:
            logger.warning(f"B2C result for unknown ConversationID: {conv_id}")
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        tx.raw_callback = data
        tx.result_code  = result_code
        tx.result_desc  = result.get('ResultDesc', '')

        from apps.emergencies.models import EmergencyRequest
        from apps.notifications.tasks import notify_payout_result

        if result_code == '0':
            params = {
                p['Key']: p.get('Value')
                for p in result.get('ResultParameters', {}).get('ResultParameter', [])
            }
            tx.mpesa_receipt = params.get('TransactionReceipt', '')
            tx.status        = 'success'
            tx.save()

            EmergencyRequest.objects.filter(id=tx.reference_id).update(
                status='paid',
                mpesa_ref=tx.mpesa_receipt,
                resolved_at=timezone.now()
            )
            notify_payout_result.delay(tx.reference_id, success=True)
        else:
            tx.status = 'failed'
            tx.save()
            EmergencyRequest.objects.filter(id=tx.reference_id).update(status='failed')
            notify_payout_result.delay(tx.reference_id, success=False)

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class B2CTimeoutView(APIView):
    """Safaricom calls this if the B2C request times out."""
    permission_classes = [AllowAny]

    def post(self, request):
        conv_id = request.data.get('Result', {}).get('ConversationID', '')
        MpesaTransaction.objects.filter(checkout_request_id=conv_id).update(status='timeout')
        logger.error(f"B2C timeout for ConversationID: {conv_id}")
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})
