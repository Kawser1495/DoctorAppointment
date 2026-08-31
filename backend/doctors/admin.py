from django import forms
from django.contrib import admin

from .models import (
    Department,
    Doctor,
    DoctorSchedule,
    TimeSlot,
)


# ==========================================================
# Doctor Schedule Form
# ==========================================================

class DoctorScheduleAdminForm(forms.ModelForm):

    start_time = forms.TimeField(
        widget=forms.TimeInput(
            format="%H:%M",
            attrs={
                "type": "time",
            },
        )
    )

    end_time = forms.TimeField(
        widget=forms.TimeInput(
            format="%H:%M",
            attrs={
                "type": "time",
            },
        )
    )

    class Meta:

        model = DoctorSchedule

        fields = "__all__"


# ==========================================================
# Time Slot Form
# ==========================================================

class TimeSlotAdminForm(forms.ModelForm):

    slot_time = forms.TimeField(
        widget=forms.TimeInput(
            format="%H:%M",
            attrs={
                "type": "time",
            },
        )
    )

    class Meta:

        model = TimeSlot

        fields = "__all__"


# ==========================================================
# Department
# ==========================================================

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


# ==========================================================
# Doctor
# ==========================================================

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


# ==========================================================
# Doctor Schedule
# ==========================================================

@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):

    form = DoctorScheduleAdminForm

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


# ==========================================================
# Time Slot
# ==========================================================

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):

    form = TimeSlotAdminForm

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