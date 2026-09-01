from django.contrib import admin

from .models import (
    PatientProfile,
    FamilyMember,
)


# ==========================================================
# Patient Profile Admin
# ==========================================================

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "user",
        "phone",
        "gender",
        "date_of_birth",
        "blood_group",
        "created_at",
    ]

    search_fields = [
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__phone",
    ]

    list_filter = [
        "gender",
        "blood_group",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    # ======================================================
    # Patient Phone
    # ======================================================

    @admin.display(
        description="Phone",
        ordering="user__phone",
    )
    def phone(self, obj):

        return obj.user.phone


# ==========================================================
# Family Member Admin
# ==========================================================

@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "name",
        "patient",
        "relation",
        "age",
        "gender",
        "phone_number",
        "created_at",
    ]

    search_fields = [
        "name",
        "patient__user__username",
        "patient__user__first_name",
        "patient__user__last_name",
        "phone_number",
    ]

    list_filter = [
        "relation",
        "gender",
    ]

    readonly_fields = [
        "created_at",
    ]