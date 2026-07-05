import uuid
from django.db import models
from django.utils import timezone
from patients.models import PatientProfile, FamilyMember
from doctors.models import Doctor, TimeSlot


def generate_booking_number():
    """
    Example:
    APT-20260705-A1B2C3
    """
    today = timezone.now().strftime("%Y%m%d")
    unique = uuid.uuid4().hex[:6].upper()
    return f"APT-{today}-{unique}"


class Appointment(models.Model):

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rejected', 'Rejected'),
        ('No Show', 'No Show'),
    ]

    booking_number = models.CharField(
        max_length=30,
        unique=True,
        default=generate_booking_number,
        editable=False,
    )

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    appointment_date = models.DateField()

    reason = models.TextField(
        help_text="Reason for the appointment"
    )

    symptoms = models.TextField(
        blank=True,
        help_text="Patient symptoms (Optional)"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-appointment_date', '-created_at']
        verbose_name = "Appointment"
        verbose_name_plural = "Appointments"

    def __str__(self):
        patient_name = (
            self.family_member.full_name
            if self.family_member
            else self.patient.full_name
        )

        return (
            f"{self.booking_number} | "
            f"{patient_name} | "
            f"Dr. {self.doctor.user.get_full_name()}"
        )