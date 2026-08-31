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
        "description",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
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

    # Make ID and Doctor Name clickable
    list_display_links = (
        "id",
        "get_doctor_name",
    )

    list_filter = (
        "department",
        "is_available",
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__email",
        "specialization",
        "department__name",
    )

    ordering = (
        "user__first_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    # ======================================================
    # Better Doctor Profile Edit Page
    # ======================================================

    fieldsets = (

        (
            "Doctor Account",
            {
                "fields": (
                    "user",
                )
            }
        ),

        (
            "Professional Information",
            {
                "fields": (
                    "department",
                    "specialization",
                    "qualification",
                    "experience",
                    "consultation_fee",
                    "is_available",
                )
            }
        ),

        (
            "Profile Information",
            {
                "fields": (
                    "biography",
                    "profile_image",
                )
            }
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            }
        ),

    )

    # ======================================================
    # Doctor Name
    # ======================================================

    @admin.display(
        description="Doctor",
        ordering="user__first_name",
    )
    def get_doctor_name(self, obj):

        full_name = obj.user.get_full_name().strip()

        if full_name:
            return full_name

        return obj.user.username


# ==========================================================
# Time Slot Inline
# ==========================================================

class TimeSlotInline(admin.TabularInline):

    model = TimeSlot

    extra = 0

    fields = (
        "slot_time",
        "max_patient",
        "booked_count",
        "is_active",
    )

    readonly_fields = (
        "booked_count",
    )

    ordering = (
        "slot_time",
    )

    can_delete = True


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
        "total_slots",
    )

    list_display_links = (
        "doctor",
        "day",
    )

    list_filter = (
        "day",
        "is_active",
        "slot_duration_minutes",
    )

    search_fields = (
        "doctor__user__username",
        "doctor__user__first_name",
        "doctor__user__last_name",
        "doctor__department__name",
    )

    ordering = (
        "doctor",
        "day",
        "start_time",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (

        (
            "Schedule Information",
            {
                "fields": (
                    "doctor",
                    "day",
                    "is_active",
                )
            }
        ),

        (
            "Working Hours",
            {
                "fields": (
                    "start_time",
                    "end_time",
                )
            }
        ),

        (
            "Automatic Slot Settings",
            {
                "fields": (
                    "slot_duration_minutes",
                    "max_patient_per_slot",
                ),
                "description": (
                    "Time slots will be automatically generated "
                    "based on the working hours and slot duration."
                ),
            }
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            }
        ),

    )

    inlines = [
        TimeSlotInline,
    ]

    actions = [
        "generate_time_slots",
    ]

    # ======================================================
    # Total Slots
    # ======================================================

    @admin.display(
        description="Total Slots",
    )
    def total_slots(self, obj):

        return obj.slots.count()

    # ======================================================
    # Save Schedule
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

        # Generate slots manually here only if
        # your model save() does NOT auto-generate slots

        obj.generate_slots()

    # ======================================================
    # Manual Admin Action
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
        "id",
        "get_doctor",
        "get_day",
        "slot_time",
        "max_patient",
        "booked_count",
        "remaining_seats",
        "is_full",
        "is_active",
    )

    list_display_links = (
        "id",
        "slot_time",
    )

    list_filter = (
        "is_active",
        "schedule__day",
        "schedule__doctor",
    )

    search_fields = (
        "schedule__doctor__user__username",
        "schedule__doctor__user__first_name",
        "schedule__doctor__user__last_name",
        "schedule__doctor__department__name",
    )

    ordering = (
        "schedule__doctor",
        "schedule__day",
        "slot_time",
    )

    readonly_fields = (
        "booked_count",
        "remaining_seats",
        "is_full",
        "created_at",
        "updated_at",
    )

    fieldsets = (

        (
            "Slot Information",
            {
                "fields": (
                    "schedule",
                    "slot_time",
                    "max_patient",
                    "is_active",
                )
            }
        ),

        (
            "Booking Information",
            {
                "fields": (
                    "booked_count",
                    "remaining_seats",
                    "is_full",
                )
            }
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            }
        ),

    )

    # ======================================================
    # Doctor Name
    # ======================================================

    @admin.display(
        description="Doctor",
    )
    def get_doctor(self, obj):

        return obj.schedule.doctor

    # ======================================================
    # Schedule Day
    # ======================================================

    @admin.display(
        description="Day",
    )
    def get_day(self, obj):

        return obj.schedule.day