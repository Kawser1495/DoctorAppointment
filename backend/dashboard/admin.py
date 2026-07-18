from django.contrib import admin
from .models import DashboardStatistic


@admin.register(DashboardStatistic)
class DashboardStatisticAdmin(admin.ModelAdmin):

    list_display = (
        "total_patients",
        "total_doctors",
        "total_appointments",
        "total_departments",
        "total_payments",
        "last_updated",
    )

    readonly_fields = (
        "last_updated",
    )

    search_fields = ()

    ordering = (
        "-last_updated",
    )