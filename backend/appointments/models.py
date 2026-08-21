import uuid

from django.db import models
from django.utils import timezone

from patients.models import PatientProfile, FamilyMember
from doctors.models import Doctor, TimeSlot


# ==========================================================
# Booking Number Generator
# ==========================================================

def generate_booking_number():
    """
    Example:
    APT-20260809-A1B2C3
    """

    today = timezone.now().strftime("%Y%m%d")
    unique = uuid.uuid4().hex[:6].upper()

    return f"APT-{today}-{unique}"


# ==========================================================
# Appointment Model
# ==========================================================

class Appointment(models.Model):

    # ======================================================
    # Appointment Status
    # ======================================================

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
        ("Rejected", "Rejected"),
        ("No Show", "No Show"),
    ]

    # ======================================================
    # Booking Number
    # ======================================================

    booking_number = models.CharField(
        max_length=30,
        unique=True,
        default=generate_booking_number,
        editable=False,
    )

    # ======================================================
    # Patient
    # ======================================================

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    # ======================================================
    # Family Member
    # ======================================================

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )

    # ======================================================
    # Doctor
    # ======================================================

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    # ======================================================
    # Time Slot
    # ======================================================

    slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    # ======================================================
    # Appointment Date
    # ======================================================

    appointment_date = models.DateField()

    # ======================================================
    # Reason
    # ======================================================

    reason = models.TextField(
        help_text="Reason for the appointment",
    )

    # ======================================================
    # Symptoms
    # ======================================================

    symptoms = models.TextField(
        blank=True,
        help_text="Patient symptoms (Optional)",
    )

    # ======================================================
    # Status
    # ======================================================

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    # ======================================================
    # Timestamps
    # ======================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        ordering = [
            "-appointment_date",
            "-created_at",
        ]

        verbose_name = "Appointment"

        verbose_name_plural = "Appointments"

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        if self.family_member:

            patient_name = self.family_member.name

        else:

            patient_name = self.patient.user.get_full_name()

        return (
            f"{self.booking_number} | "
            f"{patient_name} | "
            f"Dr. {self.doctor.user.get_full_name()}"
        )