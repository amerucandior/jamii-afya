from django.db import models
from django.conf import settings


class Group(models.Model):
    """A chama, welfare group, or neighbourhood association."""

    name        = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL,
                                    on_delete=models.PROTECT,
                                    related_name='created_groups')
    invite_code = models.CharField(max_length=12, unique=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    # ── Payout rules ──────────────────────────────────────────────────────────
    min_contributions_to_qualify = models.PositiveIntegerField(default=3)
    max_payout_amount            = models.DecimalField(max_digits=10, decimal_places=2, default=50000)
    approval_threshold           = models.PositiveIntegerField(default=3,
        help_text="Number of admin approvals required to release funds")

    class Meta:
        db_table = 'groups'
        indexes  = [models.Index(fields=['invite_code'])]

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    class Role(models.TextChoices):
        ADMIN  = 'admin',  'Admin'
        MEMBER = 'member', 'Member'

    class Status(models.TextChoices):
        ACTIVE    = 'active',    'Active'
        SUSPENDED = 'suspended', 'Suspended'
        LEFT      = 'left',      'Left'

    group      = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='group_memberships')
    role       = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    joined_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table   = 'group_members'
        unique_together = ('group', 'user')
        indexes    = [models.Index(fields=['group', 'status'])]

    def __str__(self):
        return f"{self.user} in {self.group} ({self.role})"
