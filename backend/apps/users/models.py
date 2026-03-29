from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField


class User(AbstractUser):
    """Extended user: phone is the primary login identifier for M-Pesa linkage."""

    phone_number = PhoneNumberField(unique=True, region='KE')
    national_id  = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_verified  = models.BooleanField(default=False)
    profile_pic  = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'phone_number'
    REQUIRED_FIELDS = ['username', 'email']

    class Meta:
        db_table  = 'users'
        indexes   = [models.Index(fields=['phone_number']),
                     models.Index(fields=['national_id'])]

    def __str__(self):
        return f"{self.get_full_name()} ({self.phone_number})"
