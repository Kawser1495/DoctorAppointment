from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    list_display = (
        "booking_number",
        "patient",
        "doctor",
        "appointment_date",
        "status",
    )

    list_filter = (
        "status",
        "appointment_date",
    )

    search_fields = (
        "booking_number",
        "patient__user__username",
        "patient__user__first_name",
        "patient__user__last_name",
        "doctor__user__username",
        "doctor__user__first_name",
        "doctor__user__last_name",
    )