from django.db import models
from django.utils import timezone
from patients.models import PatientProfile, FamilyMember
from doctors.models import Doctor, TimeSlot


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
        max_length=25,
        unique=True,
        blank=True,
        null=True
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

    reason = models.TextField()

    symptoms = models.TextField(
        blank=True,
        null=True
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
        if self.booking_number:
            return self.booking_number
        return f"{self.patient.full_name} - {self.doctor.user.get_full_name()}"

    def save(self, *args, **kwargs):

        if not self.booking_number:

            date = timezone.now().strftime("%Y%m%d")

            last = Appointment.objects.order_by('-id').first()

            if last:
                number = last.id + 1
            else:
                number = 1

            self.booking_number = f"APT-{date}-{number:04d}"

        super().save(*args, **kwargs)