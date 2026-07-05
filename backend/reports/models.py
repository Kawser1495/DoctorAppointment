from django.db import models
from patients.models import PatientProfile
from doctors.models import Doctor
from appointments.models import Appointment


class MedicalReport(models.Model):

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE
    )

    report_title = models.CharField(
        max_length=150
    )

    report_file = models.FileField(
        upload_to="medical_reports/"
    )

    prescription = models.TextField(
        blank=True
    )

    remarks = models.TextField(
        blank=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.report_title
