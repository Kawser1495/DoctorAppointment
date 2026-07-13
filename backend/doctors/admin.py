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
        "experience",
        "consultation_fee",
        "is_available",
    )

    search_fields = (
        "user__username",
        "specialization",
    )

    list_filter = (
        "department",
        "is_available",
    )


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "doctor",
        "day",
        "start_time",
        "end_time",
        "is_active",
    )

    list_filter = (
        "day",
        "is_active",
    )


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "schedule",
        "slot_time",
        "max_patient",
        "booked_count",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "schedule__doctor__user__username",
    )