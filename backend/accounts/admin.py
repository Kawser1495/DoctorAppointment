from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):

    # ==========================================================
    # LIST DISPLAY
    # ==========================================================

    list_display = (
        "id",
        "username",
        "email",
        "phone",
        "role",
        "is_verified",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )

    # ==========================================================
    # FILTERS
    # ==========================================================

    list_filter = (
        "role",
        "is_verified",
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )

    # ==========================================================
    # SEARCH
    # ==========================================================

    search_fields = (
        "username",
        "email",
        "phone",
        "first_name",
        "last_name",
    )

    # ==========================================================
    # DEFAULT ORDERING
    # ==========================================================

    ordering = (
        "-date_joined",
    )

    # ==========================================================
    # READONLY FIELDS
    # ==========================================================

    readonly_fields = (
        "date_joined",
        "last_login",
        "created_at",
        "updated_at",
    )

    # ==========================================================
    # FIELD GROUPS
    # ==========================================================

    fieldsets = (

        (
            "Login Information",
            {
                "fields": (
                    "username",
                    "password",
                )
            },
        ),

        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                )
            },
        ),

        (
            "Role & Verification",
            {
                "fields": (
                    "role",
                    "is_verified",
                )
            },
        ),

        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),

        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    # ==========================================================
    # ADD USER FORM
    # ==========================================================

    add_fieldsets = (

        (
            "Account Information",
            {
                "classes": (
                    "wide",
                ),

                "fields": (
                    "username",
                    "password1",
                    "password2",
                ),
            },
        ),

        (
            "Personal Information",
            {
                "classes": (
                    "wide",
                ),

                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "phone",
                ),
            },
        ),

        (
            "Role",
            {
                "classes": (
                    "wide",
                ),

                "fields": (
                    "role",
                    "is_verified",
                ),
            },
        ),

        (
            "Permissions",
            {
                "classes": (
                    "wide",
                ),

                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
