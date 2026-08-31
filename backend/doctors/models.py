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
        help_text="Duration of each appointment slot in minutes.",
    )

    max_patient_per_slot = models.PositiveIntegerField(
        default=1,
        help_text="Maximum patients allowed in each generated slot.",
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
        ]

        verbose_name = "Doctor Schedule"

        verbose_name_plural = "Doctor Schedules"

    def __str__(self):

        return (
            f"{self.doctor} - "
            f"{self.day} - "
            f"{self.start_time} to {self.end_time}"
        )

    # ======================================================
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        if self.start_time and self.end_time:

            if self.start_time >= self.end_time:

                raise ValidationError({

                    "end_time":
                        "End time must be later than start time."

                })

        if self.slot_duration_minutes <= 0:

            raise ValidationError({

                "slot_duration_minutes":
                    "Slot duration must be greater than zero."

            })

        if self.max_patient_per_slot <= 0:

            raise ValidationError({

                "max_patient_per_slot":
                    "Maximum patients per slot must be greater than zero."

            })

    # ======================================================
    # Save with Validation
    # ======================================================

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )

    # ======================================================
    # Automatically Generate Time Slots
    # ======================================================

    def generate_slots(self):

        from .utils import generate_time_slots

        return generate_time_slots(self)


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
        help_text="Maximum number of patients allowed.",
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
            "slot_time"
        ]

        verbose_name = "Time Slot"

        verbose_name_plural = "Time Slots"

    def __str__(self):

        return (
            f"{self.schedule.doctor} | "
            f"{self.schedule.day} | "
            f"{self.slot_time}"
        )

    # ======================================================
    # Check if slot is full
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
    # Validation
    # ======================================================

    def clean(self):

        super().clean()

        if self.booked_count > self.max_patient:

            raise ValidationError({

                "booked_count":
                    "Booked patient count cannot exceed maximum patient capacity."

            })

    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )