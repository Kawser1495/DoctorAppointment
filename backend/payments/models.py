from django.db import models
from django.db.models import Q

from patients.models import PatientProfile
from appointments.models import Appointment
from diagnostics.models import TestBooking


# ==========================================================
# Payment Model
# ==========================================================

class Payment(models.Model):

    # ======================================================
    # Payment Method
    # ======================================================

    PAYMENT_METHOD_CHOICES = [

        ("Bkash", "Bkash"),
        ("Nagad", "Nagad"),
        ("Rocket", "Rocket"),
        ("Card", "Card"),
        ("Cash", "Cash"),

    ]

    # ======================================================
    # Payment Mode
    # ======================================================

    PAYMENT_MODE_CHOICES = [

        ("Partial", "Partial Payment"),
        ("Full", "Full Payment"),

    ]

    # ======================================================
    # Payment Status
    # ======================================================

    PAYMENT_STATUS_CHOICES = [

        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),

    ]

    # ======================================================
    # Patient
    # ======================================================

    patient = models.ForeignKey(

        PatientProfile,

        on_delete=models.CASCADE,

        related_name="payments",

    )

    # ======================================================
    # Appointment Payment
    # ======================================================

    appointment = models.ForeignKey(

        Appointment,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name="payments",

    )

    # ======================================================
    # Diagnostic Test Payment
    # ======================================================

    test_booking = models.ForeignKey(

        TestBooking,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

        related_name="payments",

    )

    # ======================================================
    # Payment Amount
    #
    # This is the amount paid in this transaction.
    #
    # Example:
    #
    # Total Fee = 1000
    # First Payment = 300
    #
    # amount = 300
    # ======================================================

    amount = models.DecimalField(

        max_digits=10,

        decimal_places=2,

    )

    # ======================================================
    # Payment Mode
    #
    # Partial = Current transaction does not complete
    #           the full payable amount.
    #
    # Full = Current transaction completes the full
    #        payable amount.
    # ======================================================

    payment_mode = models.CharField(

        max_length=20,

        choices=PAYMENT_MODE_CHOICES,

        default="Full",

    )

    # ======================================================
    # Payment Method
    # ======================================================

    payment_method = models.CharField(

        max_length=20,

        choices=PAYMENT_METHOD_CHOICES,

    )

    # ======================================================
    # Transaction ID
    # ======================================================

    transaction_id = models.CharField(

        max_length=100,

        unique=True,

    )

    # ======================================================
    # Payment Status
    # ======================================================

    payment_status = models.CharField(

        max_length=20,

        choices=PAYMENT_STATUS_CHOICES,

        default="Pending",

    )

    # ======================================================
    # Refund Eligibility
    #
    # Automatically controlled by backend.
    #
    # Partial Payment:
    # False
    #
    # Full Completed Payment:
    # True
    # ======================================================

    is_refundable = models.BooleanField(

        default=False,

    )

    # ======================================================
    # Notification Tracking
    # ======================================================

    payment_notification_sent = models.BooleanField(

        default=False,

    )

    # ======================================================
    # Dates
    # ======================================================

    payment_date = models.DateTimeField(

        auto_now_add=True,

    )

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

            "-payment_date",

        ]

        verbose_name = "Payment"

        verbose_name_plural = "Payments"

        constraints = [

            # --------------------------------------------------
            # Payment must belong to exactly one source.
            # --------------------------------------------------

            models.CheckConstraint(

                condition=(

                    Q(
                        appointment__isnull=False
                    )

                    ^

                    Q(
                        test_booking__isnull=False
                    )

                ),

                name=(
                    "payment_for_exactly_one_source"
                ),

            ),

            # --------------------------------------------------
            # Amount must be greater than zero.
            # --------------------------------------------------

            models.CheckConstraint(

                condition=Q(

                    amount__gt=0

                ),

                name=(
                    "payment_amount_must_be_positive"
                ),

            ),

        ]

    # ======================================================
    # Payment Source Type
    # ======================================================

    @property
    def payment_type(self):

        if self.appointment:

            return "Appointment"

        if self.test_booking:

            return "Diagnostic Test"

        return "Unknown"

    # ======================================================
    # Expected Total Amount
    #
    # Returns the original total cost.
    # ======================================================

    @property
    def total_amount(self):

        if self.appointment:

            return (

                self.appointment
                .doctor
                .consultation_fee

            )

        if self.test_booking:

            return (

                self.test_booking
                .diagnostic_test
                .price

            )

        return 0

    # ======================================================
    # Total Paid Amount
    #
    # Calculates all successfully paid payments
    # for the same appointment/test.
    # ======================================================

    @property
    def total_paid_amount(self):

        from django.db.models import Sum


        queryset = Payment.objects.filter(

            patient=self.patient,

            payment_status="Paid",

        )


        # --------------------------------------------------
        # Appointment Payments
        # --------------------------------------------------

        if self.appointment:

            queryset = queryset.filter(

                appointment=self.appointment

            )


        # --------------------------------------------------
        # Diagnostic Test Payments
        # --------------------------------------------------

        elif self.test_booking:

            queryset = queryset.filter(

                test_booking=self.test_booking

            )


        else:

            return 0


        total = queryset.aggregate(

            total=Sum(
                "amount"
            )

        )["total"]


        return total or 0

    # ======================================================
    # Remaining Amount
    # ======================================================

    @property
    def remaining_amount(self):

        remaining = (

            self.total_amount

            -

            self.total_paid_amount

        )


        return max(

            remaining,

            0

        )

    # ======================================================
    # Is Fully Paid
    # ======================================================

    @property
    def is_fully_paid(self):

        return (

            self.total_paid_amount

            >=

            self.total_amount

        )

    # ======================================================
    # Refund Amount
    #
    # Currently full amount of this payment.
    #
    # This can later be extended to support
    # partial refund if needed.
    # ======================================================

    @property
    def refundable_amount(self):

        if (

            self.payment_status == "Paid"

            and

            self.is_refundable

        ):

            return self.amount


        return 0

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        return (

            f"{self.transaction_id} | "

            f"{self.patient.user.get_full_name()} | "

            f"{self.payment_mode} | "

            f"{self.payment_status}"

        )


# ==========================================================
# Refund Request Model
# ==========================================================

class RefundRequest(models.Model):

    # ======================================================
    # Refund Status
    # ======================================================

    REFUND_STATUS_CHOICES = [

        ("Pending", "Pending"),

        ("Approved", "Approved"),

        ("Rejected", "Rejected"),

        ("Completed", "Completed"),

    ]

    # ======================================================
    # Payment
    # ======================================================

    payment = models.ForeignKey(

        Payment,

        on_delete=models.CASCADE,

        related_name="refund_requests",

    )

    # ======================================================
    # Patient
    #
    # Stored separately for easier querying.
    # ======================================================

    patient = models.ForeignKey(

        PatientProfile,

        on_delete=models.CASCADE,

        related_name="refund_requests",

    )

    # ======================================================
    # Refund Amount
    # ======================================================

    refund_amount = models.DecimalField(

        max_digits=10,

        decimal_places=2,

    )

    # ======================================================
    # Refund Reason
    # ======================================================

    reason = models.TextField()

    # ======================================================
    # Refund Status
    # ======================================================

    refund_status = models.CharField(

        max_length=20,

        choices=REFUND_STATUS_CHOICES,

        default="Pending",

    )

    # ======================================================
    # Admin Note
    # ======================================================

    admin_note = models.TextField(

        blank=True,

    )

    # ======================================================
    # Dates
    # ======================================================

    requested_at = models.DateTimeField(

        auto_now_add=True,

    )

    updated_at = models.DateTimeField(

        auto_now=True,

    )

    processed_at = models.DateTimeField(

        null=True,

        blank=True,

    )

    # ======================================================
    # Meta
    # ======================================================

    class Meta:

        ordering = [

            "-requested_at",

        ]

        verbose_name = "Refund Request"

        verbose_name_plural = "Refund Requests"

        constraints = [

            # --------------------------------------------------
            # Refund amount must be greater than zero.
            # --------------------------------------------------

            models.CheckConstraint(

                condition=Q(

                    refund_amount__gt=0

                ),

                name=(
                    "refund_amount_must_be_positive"
                ),

            ),

        ]

    # ======================================================
    # String Representation
    # ======================================================

    def __str__(self):

        return (

            f"Refund #{self.id} | "

            f"Payment #{self.payment.id} | "

            f"{self.refund_status}"

        )