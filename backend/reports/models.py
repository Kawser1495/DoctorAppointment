from django.db import models

from patients.models import PatientProfile
from doctors.models import Doctor
from appointments.models import Appointment
from diagnostics.models import TestBooking


class MedicalReport(models.Model):

    REPORT_STATUS_CHOICES = (
        ("Draft", "Draft"),
        ("Published", "Published"),
        ("Archived", "Archived"),
    )

    REPORT_TYPE_CHOICES = (
        ("Medical", "Medical"),
        ("Diagnostic", "Diagnostic"),
    )

    # ======================================================
    # Report Type
    # ======================================================

    report_type = models.CharField(
        max_length=20,
        choices=REPORT_TYPE_CHOICES,
        default="Medical",
    )

    # ======================================================
    # Patient
    # ======================================================

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="medical_reports",
    )

    # ======================================================
    # Doctor
    # Optional for Diagnostic Report
    # ======================================================

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_reports",
    )

    # ======================================================
    # Appointment
    # Medical report normally comes from appointment
    # ======================================================

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_reports",
    )

    # ======================================================
    # Diagnostic Booking
    # ======================================================

    test_booking = models.OneToOneField(
        TestBooking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="medical_report",
    )

    # ======================================================
    # Report Title
    # ======================================================

    report_title = models.CharField(
        max_length=150,
    )

    report_status = models.CharField(
        max_length=20,
        choices=REPORT_STATUS_CHOICES,
        default="Published",
        db_index=True,
    )

    # ======================================================
    # Report File
    # PDF / JPG / PNG etc.
    # ======================================================

    report_file = models.FileField(
        upload_to="medical_reports/%Y/%m/",
        blank=True,
        null=True,
    )

    # ======================================================
    # Prescription
    # ======================================================

    prescription = models.TextField(
        blank=True,
    )

    # ======================================================
    # Remarks
    # ======================================================

    remarks = models.TextField(
        blank=True,
    )

    # ======================================================
    # Uploaded At
    # ======================================================

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):

        return (
            f"{self.report_type} | "
            f"{self.report_title}"
        )