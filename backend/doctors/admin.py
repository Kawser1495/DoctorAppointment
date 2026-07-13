from django.contrib import admin
from .models import Department, Doctor, DoctorSchedule, TimeSlot


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "description",
    )

    search_fields = (
        "name",
    )


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "department",
        "specialization",
        "consultation_fee",
    )

    search_fields = (
        "user__username",
        "specialization",
    )

    list_filter = (
        "department",
    )


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "doctor",
        "day",
        "start_time",
        "end_time",
    )

    list_filter = (
        "day",
    )


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = (
        "doctor",
        "date",
        "start_time",
        "end_time",
        "is_booked",
    )

    list_filter = (
        "is_booked",
        "date",
    )