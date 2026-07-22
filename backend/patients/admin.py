from django.contrib import admin

from .models import PatientProfile, FamilyMember


# ==========================================
# Patient Profile Admin
# ==========================================

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "phone_number",
        "gender",
        "blood_group",
        "emergency_contact",
        "created_at",
    )

    search_fields = (
        "user__first_name",
        "user__last_name",
        "user__username",
        "phone_number",
        "blood_group",
    )

    list_filter = (
        "gender",
        "blood_group",
    )

    ordering = (
        "user__first_name",
    )


# ==========================================
# Family Member Admin
# ==========================================

@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "patient",
        "name",
        "relation",
        "age",
        "gender",
        "phone_number",
        "created_at",
    )

    search_fields = (
        "name",
        "patient__user__first_name",
        "patient__user__last_name",
    )

    list_filter = (
        "relation",
        "gender",
    )

    ordering = (
        "name",
    )