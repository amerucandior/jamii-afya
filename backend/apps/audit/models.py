from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """
    Immutable record of every write action for fraud prevention & dispute resolution.
    Written by AuditLogMiddleware — never deleted.
    """
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, related_name='audit_logs')
    action      = models.CharField(max_length=10)   # POST / PATCH / DELETE
    endpoint    = models.CharField(max_length=255)
    payload     = models.JSONField(default=dict)
    response_code = models.PositiveSmallIntegerField()
    ip_address  = models.GenericIPAddressField(null=True)
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        indexes  = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['endpoint', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user} | {self.action} {self.endpoint} | {self.timestamp}"
