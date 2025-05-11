from django.contrib import admin
from .models import User, Request, Contact

# Register your models here.
admin.site.register(User)


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = (
        "article",
        "phone",
        "size",
        "color",
        "creation_date",
        "is_seen",
        "is_delivered",
    )
    search_fields = ("article", "size", "is_delivered")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("fullName", "email", "phoneNumber", "timestamp", "read")
    list_filter = ("read", "timestamp")
    search_fields = ("fullName", "email", "phoneNumber", "message")
    readonly_fields = ("timestamp",)
    
    def mark_as_read(self, request, queryset):
        queryset.update(read=True)
    mark_as_read.short_description = "Mark selected messages as read"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(read=False)
    mark_as_unread.short_description = "Mark selected messages as unread"
    
    actions = ["mark_as_read", "mark_as_unread"]
