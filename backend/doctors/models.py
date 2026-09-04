from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import CustomUser


# ==========================================================
# Department
# ==========================================================

class Department(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        ordering = [
            "name"
        ]

        verbose_name = "Department"

        verbose_name_plural = "Departments"

    def __str__(self):

        return self.name


# ==========================================================
# Doctor
# ==========================================================

class Doctor(models.Model):

    # ======================================================
    # Approval Status
    # ======================================================

    APPROVAL_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name="doctors",
    )

    specialization = models.CharField(
        max_length=150,
    )

    qualification = models.CharField(
        max_length=200,
    )

    experience = models.PositiveIntegerField(
        help_text="Experience in years",
    )

    consultation_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )

    biography = models.TextField(
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="doctor_profiles/",
        blank=True,
        null=True,
    )

    # ======================================================
    # Doctor Approval System
    # ======================================================

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS_CHOICES,
        default="pending",
        db_index=True,
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True,
    )

    approved_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    # ======================================================
    # Availability
    # ======================================================

    is_available = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        ordering = [
            "user__first_name",
            "user__username",
        ]

        verbose_name = "Doctor"

        verbose_name_plural = "Doctors"

    def __str__(self):

        full_name = (
            self.user.get_full_name().strip()
        )

        if full_name:
            return f"Dr. {full_name}"

        return f"Dr. {self.user.username}"

    # ======================================================
    # Automatically assign doctor role
    # ======================================================

    def save(self, *args, **kwargs):

        super().save(
            *args,
            **kwargs
        )

        if self.user.role != "doctor":

            self.user.role = "doctor"

            self.user.save(
                update_fields=[
                    "role"
                ]
            )


# ==========================================================
# Doctor Schedule
# ==========================================================

class DoctorSchedule(models.Model):

    DAYS = (

        ("Sunday", "Sunday"),
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),

    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="schedules",
    )

    day = models.CharField(
        max_length=20,
        choices=DAYS,
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    # ======================================================
    # Automatic Slot Settings
    # ======================================================

    slot_duration_minutes = models.PositiveIntegerField(
        default=30,
        help_text=(
            "Appointment duration in minutes. "
            "Example: 15, 20, 30, 45, 60."
        ),
    )

    max_patient_per_slot = models.PositiveIntegerField(
        default=1,
        help_text=(
            "Maximum number of patients "
            "allowed in each time slot."
        ),
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "day",
                ],
                name="unique_doctor_schedule_day",
            ),

        ]

        ordering = [
            "doctor",
            "day",
            "start_time",
        ]

        verbose_name = "Doctor Schedule"

        verbose_name_plural = "Doctor Schedules"

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        return (
            f"{self.doctor} | "
            f"{self.day} | "
            f"{self.start_time.strftime('%I:%M %p')} - "
            f"{self.end_time.strftime('%I:%M %p')}"
        )

    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        # --------------------------------------------------
        # Start time must be before end time
        # --------------------------------------------------

        if (
            self.start_time
            and self.end_time
            and self.start_time >= self.end_time
        ):

            raise ValidationError({

                "end_time":
                    (
                        "End time must be later "
                        "than start time."
                    )

            })

        # --------------------------------------------------
        # Slot duration validation
        # --------------------------------------------------

        if (
            self.slot_duration_minutes
            and self.slot_duration_minutes <= 0
        ):

            raise ValidationError({

                "slot_duration_minutes":
                    (
                        "Slot duration must be "
                        "greater than zero."
                    )

            })

        # --------------------------------------------------
        # Maximum patient validation
        # --------------------------------------------------

        if (
            self.max_patient_per_slot
            and self.max_patient_per_slot <= 0
        ):

            raise ValidationError({

                "max_patient_per_slot":
                    (
                        "Maximum patients per slot "
                        "must be greater than zero."
                    )

            })

    # ======================================================
    # Save Schedule
    # ======================================================

    def save(self, *args, **kwargs):

        # Validate data first
        self.full_clean()

        # Save schedule
        super().save(
            *args,
            **kwargs
        )

        # Automatically generate/synchronize slots
        self.generate_slots()

    # ======================================================
    # Automatically Generate Time Slots
    # ======================================================

    def generate_slots(self):

        from .utils import generate_time_slots

        return generate_time_slots(self)

    # ======================================================
    # Get Total Slots
    # ======================================================

    @property
    def total_slots(self):

        return self.slots.count()

    # ======================================================
    # Get Active Slots
    # ======================================================

    @property
    def active_slots(self):

        return self.slots.filter(
            is_active=True
        ).count()


# ==========================================================
# Time Slot
# ==========================================================

class TimeSlot(models.Model):

    schedule = models.ForeignKey(
        DoctorSchedule,
        on_delete=models.CASCADE,
        related_name="slots",
    )

    slot_time = models.TimeField()

    max_patient = models.PositiveIntegerField(
        default=1,
        help_text=(
            "Maximum patients allowed "
            "in this slot."
        ),
    )

    booked_count = models.PositiveIntegerField(
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "schedule",
                    "slot_time",
                ],
                name="unique_schedule_slot_time",
            ),

            models.CheckConstraint(
                condition=models.Q(
                    booked_count__gte=0
                ),
                name="booked_count_non_negative",
            ),

        ]

        ordering = [
            "schedule",
            "slot_time",
        ]

        verbose_name = "Time Slot"

        verbose_name_plural = "Time Slots"

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        return (
            f"{self.schedule.doctor} | "
            f"{self.schedule.day} | "
            f"{self.slot_time.strftime('%I:%M %p')}"
        )

    # ======================================================
    # Check if Slot is Full
    # ======================================================

    @property
    def is_full(self):

        return (
            self.booked_count >=
            self.max_patient
        )

    # ======================================================
    # Remaining Patient Capacity
    # ======================================================

    @property
    def remaining_seats(self):

        return max(
            self.max_patient -
            self.booked_count,
            0,
        )

    # ======================================================
    # Slot Display Range
    # ======================================================

    @property
    def slot_end_time(self):

        from datetime import (
            datetime,
            timedelta,
        )

        start_datetime = datetime.combine(
            datetime.today().date(),
            self.slot_time,
        )

        end_datetime = (
            start_datetime
            + timedelta(
                minutes=self.schedule.slot_duration_minutes
            )
        )

        return end_datetime.time()

    # ======================================================
    # Formatted Slot Range
    # ======================================================

    @property
    def time_range(self):

        return (

            f"{self.slot_time.strftime('%I:%M %p')} - "

            f"{self.slot_end_time.strftime('%I:%M %p')}"

        )

    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        # --------------------------------------------------
        # Booked count cannot exceed capacity
        # --------------------------------------------------

        if (
            self.booked_count is not None
            and self.max_patient is not None
            and self.booked_count > self.max_patient
        ):

            raise ValidationError({

                "booked_count":
                    (
                        "Booked patient count cannot exceed "
                        "maximum patient capacity."
                    )

            })

        # --------------------------------------------------
        # Maximum patient must be positive
        # --------------------------------------------------

        if (
            self.max_patient is not None
            and self.max_patient <= 0
        ):

            raise ValidationError({

                "max_patient":
                    (
                        "Maximum patient capacity "
                        "must be greater than zero."
                    )

            })

    # ======================================================
    # Save
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )