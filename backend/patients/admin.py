from django.contrib import admin
from .models import PatientProfile, FamilyMember


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "full_name",
        "gender",
        "blood_group",
        "emergency_contact",
    )

    search_fields = (
        "full_name",
        "blood_group",
    )

    list_filter = (
        "gender",
        "blood_group",
    )


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "patient",
        "name",
        "relation",
        "age",
        "gender",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "relation",
        "gender",
    )