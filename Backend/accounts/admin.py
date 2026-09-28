#from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User


class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ["email", "name", "role", "is_active", "is_staff"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "role", "password1", "password2", "is_staff", "is_superuser"),
        }),
    )
    search_fields = ("email", "name")


admin.site.register(User, UserAdmin)
