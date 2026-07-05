from django.db import models
from patients.models import PatientProfile, FamilyMember
from doctors.models import Doctor, TimeSlot

class Appointment(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments"
    )

    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)

    slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)

    appointment_date = models.DateField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    def __str__(self):
        return f"{self.patient.full_name} - {self.doctor.user.username}"
