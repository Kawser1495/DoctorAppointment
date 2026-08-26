import uuid

from django.db import models
from django.utils import timezone

from patients.models import PatientProfile, FamilyMember


# ==========================================================
# Booking Number Generator
# ==========================================================

def generate_test_booking_number():
    """
    Example:
    TEST-20260826-A1B2C3
    """

    today = timezone.now().strftime("%Y%m%d")

    unique = uuid.uuid4().hex[:6].upper()

    return f"TEST-{today}-{unique}"


# ==========================================================
# Test Category
# ==========================================================

class TestCategory(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ["name"]

        verbose_name = "Test Category"

        verbose_name_plural = "Test Categories"

    def __str__(self):

        return self.name


# ==========================================================
# Diagnostic Test
# ==========================================================

class DiagnosticTest(models.Model):

    category = models.ForeignKey(
        TestCategory,
        on_delete=models.CASCADE,
        related_name="tests"
    )

    name = models.CharField(
        max_length=150
    )

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    preparation = models.TextField(
        blank=True,
        help_text="Preparation before the test"
    )

    duration = models.CharField(
        max_length=100,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    is_available = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = ["name"]

        verbose_name = "Diagnostic Test"

        verbose_name_plural = "Diagnostic Tests"

    def __str__(self):

        return f"{self.name} - ৳{self.price}"


# ==========================================================
# Test Booking
# ==========================================================

class TestBooking(models.Model):

    STATUS_CHOICES = [

        ("Pending", "Pending"),

        ("Confirmed", "Confirmed"),

        ("Completed", "Completed"),

        ("Cancelled", "Cancelled"),

    ]

    # ------------------------------------------------------
    # Booking Number
    # ------------------------------------------------------

    booking_number = models.CharField(
        max_length=30,
        unique=True,
        default=generate_test_booking_number,
        editable=False
    )

    # ------------------------------------------------------
    # Patient
    # ------------------------------------------------------

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="test_bookings"
    )

    # ------------------------------------------------------
    # Family Member
    # ------------------------------------------------------

    family_member = models.ForeignKey(
        FamilyMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="test_bookings"
    )

    # ------------------------------------------------------
    # Diagnostic Test
    # ------------------------------------------------------

    diagnostic_test = models.ForeignKey(
        DiagnosticTest,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    # ------------------------------------------------------
    # Booking Date & Time
    # ------------------------------------------------------

    booking_date = models.DateField()

    booking_time = models.TimeField()

    # ------------------------------------------------------
    # Status
    # ------------------------------------------------------

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    # ------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = [
            "-booking_date",
            "-booking_time",
            "-created_at"
        ]

        verbose_name = "Test Booking"

        verbose_name_plural = "Test Bookings"

    def __str__(self):

        return (
            f"{self.booking_number} | "
            f"{self.diagnostic_test.name} | "
            f"{self.status}"
        )