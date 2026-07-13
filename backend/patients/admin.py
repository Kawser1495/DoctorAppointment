from django.contrib import admin
from .models import PatientProfile, FamilyMember


@admin.register(PatientProfile)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "full_name",
        "phone",
        "gender",
        "blood_group",
    )

    search_fields = (
        "full_name",
        "phone",
    )

    list_filter = (
        "gender",
        "blood_group",
    )


@admin.register(FamilyMember)
class FamilyMemberAdmin(admin.ModelAdmin):

    list_display = (
        "patient",
        "full_name",
        "relationship",
        "phone",
    )

    search_fields = (
        "full_name",
    )