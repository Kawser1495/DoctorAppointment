from django.db import models
from patients.models import PatientProfile, FamilyMember
from doctors.models import Doctor, TimeSlot


class Appointment(models.Model):

    STATUS_CHOICES = [

        ('pending', 'Pending'),

        ('confirmed', 'Confirmed'),

        ('completed', 'Completed'),

        ('cancelled', 'Cancelled'),

        ('rejected', 'Rejected'),

        ('no_show', 'No Show')

    ]

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE
    )

    appointment_date = models.DateField()

    reason = models.TextField()

    symptoms = models.TextField(
        blank=True
    )

    booking_number = models.CharField(
        max_length=30,
        unique=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return self.booking_number