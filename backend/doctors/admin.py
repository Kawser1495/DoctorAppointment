from django.contrib import admin

from .models import (
    Department,
    Doctor,
    DoctorSchedule,
    TimeSlot,
)


# ==========================================================
# Department Admin
# ==========================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "created_at",
    )

    search_fields = (
        "name",
    )


# ==========================================================
# Doctor Admin
# ==========================================================

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "get_doctor_name",
        "department",
        "specialization",
        "consultation_fee",
        "experience",
        "is_available",
    )

    list_filter = (
        "department",
        "is_available",
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "specialization",
    )

    def get_doctor_name(self, obj):

        return obj.user.get_full_name() or obj.user.username

    get_doctor_name.short_description = "Doctor"


# ==========================================================
# Time Slot Inline
# ==========================================================

class TimeSlotInline(admin.TabularInline):

    model = TimeSlot

    extra = 0

    readonly_fields = (
        "booked_count",
    )


# ==========================================================
# Doctor Schedule Admin
# ==========================================================

@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):

    list_display = (
        "doctor",
        "day",
        "start_time",
        "end_time",
        "slot_duration_minutes",
        "max_patient_per_slot",
        "is_active",
    )

    list_filter = (
        "day",
        "is_active",
    )

    search_fields = (
        "doctor__user__username",
        "doctor__user__first_name",
        "doctor__user__last_name",
    )

    inlines = [
        TimeSlotInline,
    ]

    actions = [
        "generate_time_slots",
    ]

    # ======================================================
    # Automatically generate slots after saving schedule
    # ======================================================

    def save_model(
        self,
        request,
        obj,
        form,
        change
    ):

        super().save_model(
            request,
            obj,
            form,
            change
        )

        obj.generate_slots()

    # ======================================================
    # Manual admin action for regenerating slots
    # ======================================================

    @admin.action(
        description="Generate/Rebuild selected schedule time slots"
    )
    def generate_time_slots(
        self,
        request,
        queryset
    ):

        count = 0

        for schedule in queryset:

            schedule.generate_slots()

            count += 1

        self.message_user(

            request,

            f"{count} schedule(s) processed successfully."

        )


# ==========================================================
# Time Slot Admin
# ==========================================================

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):

    list_display = (
        "schedule",
        "slot_time",
        "max_patient",
        "booked_count",
        "remaining_seats",
        "is_full",
        "is_active",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "schedule__doctor__user__username",
    )

    readonly_fields = (
        "booked_count",
        "is_full",
        "remaining_seats",
    )