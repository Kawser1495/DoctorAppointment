from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    list_display = (
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
        "patient__full_name",
        "doctor__user__username",
    )