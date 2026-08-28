from django.contrib import admin

from .models import MedicalReport


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):


    list_display = (

        "id",

        "report_type",

        "report_title",

        "patient",

        "doctor",

        "appointment",

        "test_booking",

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

        "test_booking__booking_number",

        "test_booking__diagnostic_test__name",

    )


    list_filter = (

        "report_type",

        "uploaded_at",

    )


    ordering = (

        "-uploaded_at",

    )