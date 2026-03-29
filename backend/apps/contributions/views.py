from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Contribution


class ContributionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    group_name  = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model  = Contribution
        fields = ['id', 'group', 'group_name', 'member', 'member_name',
                  'amount', 'status', 'mpesa_ref', 'period', 'created_at', 'confirmed_at']
        read_only_fields = ['status', 'mpesa_ref', 'confirmed_at']


class InitiateContributionSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()
    amount   = serializers.DecimalField(max_digits=10, decimal_places=2)
    period   = serializers.CharField(max_length=7)  # YYYY-MM


class ContributionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = ContributionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contribution.objects.filter(
            group__memberships__user=self.request.user,
            group__memberships__status='active'
        ).select_related('member', 'group').distinct()

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """Kick off STK Push for a contribution — M-Pesa handles the rest."""
        from apps.mpesa.services import MpesaService
        serializer = InitiateContributionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = MpesaService.stk_push(
            phone=str(request.user.phone_number),
            amount=serializer.validated_data['amount'],
            account_ref=f"GRP{serializer.validated_data['group_id']}",
            description="JamiiFund Contribution",
        )
        if result.get('ResponseCode') == '0':
            # Create pending record; confirmed on M-Pesa callback
            Contribution.objects.get_or_create(
                group_id = serializer.validated_data['group_id'],
                member   = request.user,
                period   = serializer.validated_data['period'],
                defaults = {'amount': serializer.validated_data['amount'], 'status': 'pending'}
            )
        return Response(result)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Group-level pool summary for dashboard."""
        group_id = request.query_params.get('group_id')
        qs = Contribution.objects.filter(group_id=group_id, status='confirmed')
        data = qs.aggregate(total=Sum('amount'), count=Count('id'))
        return Response(data)
