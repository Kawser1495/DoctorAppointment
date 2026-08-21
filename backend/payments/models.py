from django.db import models
from django.db.models import Q

from patients.models import PatientProfile
from appointments.models import Appointment
from diagnostics.models import TestBooking


class Payment(models.Model):

    # ==========================================
    # Payment Method
    # ==========================================

    PAYMENT_METHOD_CHOICES = [

        ("Bkash", "Bkash"),
        ("Nagad", "Nagad"),
        ("Rocket", "Rocket"),
        ("Card", "Card"),
        ("Cash", "Cash"),

    ]

    # ==========================================
    # Payment Status
    # ==========================================

    PAYMENT_STATUS_CHOICES = [

        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),

    ]

    # ==========================================
    # Patient
    # ==========================================

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    # ==========================================
    # Appointment Payment
    # ==========================================

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    # ==========================================
    # Diagnostic Test Payment
    # ==========================================

    test_booking = models.ForeignKey(
        TestBooking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )

    # ==========================================
    # Payment Information
    # ==========================================

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending",
    )

    payment_date = models.DateTimeField(
        auto_now_add=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ==========================================
    # Meta
    # ==========================================

    class Meta:

        ordering = ["-payment_date"]

        verbose_name = "Payment"

        verbose_name_plural = "Payments"

        constraints = [

            models.CheckConstraint(
                condition=(
                    Q(appointment__isnull=False) ^
                    Q(test_booking__isnull=False)
                ),
                name="payment_for_exactly_one_source",
            ),

        ]

    # ==========================================
    # String Representation
    # ==========================================

    def __str__(self):

        payment_for = "General"

        if self.appointment:

            payment_for = (
                f"Appointment ({self.appointment.booking_number})"
            )

        elif self.test_booking:

            payment_for = (
                f"Diagnostic Test ({self.test_booking.id})"
            )

        return (
            f"{self.transaction_id} | "
            f"{self.patient.user.get_full_name()} | "
            f"{payment_for} | "
            f"{self.payment_status}"
        )