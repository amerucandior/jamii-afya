from django.contrib import admin
from .models import Group, GroupMember


class GroupMemberInline(admin.TabularInline):
    model  = GroupMember
    extra  = 0
    fields = ['user', 'role', 'status', 'joined_at']
    readonly_fields = ['joined_at']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display  = ['name', 'created_by', 'is_active', 'min_contributions_to_qualify',
                     'max_payout_amount', 'approval_threshold', 'invite_code', 'created_at']
    search_fields = ['name', 'invite_code']
    list_filter   = ['is_active']
    inlines       = [GroupMemberInline]
    readonly_fields = ['invite_code']


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display  = ['user', 'group', 'role', 'status', 'joined_at']
    list_filter   = ['role', 'status']
    search_fields = ['user__phone_number', 'group__name']
