from django.contrib import admin

from .models import MedicalReport


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "report_title",
        "patient",
        "doctor",
        "appointment",
        "uploaded_at",
    )

    search_fields = (
        "report_title",
        "patient__user__username",
        "patient__user__first_name",
        "patient__user__last_name",
        "doctor__user__username",
        "doctor__user__first_name",
        "doctor__user__last_name",
        "appointment__booking_number",
    )

    list_filter = (
        "uploaded_at",
    )

    ordering = (
        "-uploaded_at",
    )
