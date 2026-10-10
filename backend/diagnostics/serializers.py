from rest_framework import serializers
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone

from .models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)


# ==========================================================
# Test Category Serializer
# ==========================================================

class TestCategorySerializer(serializers.ModelSerializer):

    class Meta:

        model = TestCategory

        fields = [
            "id",
            "name",
            "description",
            "is_active",
        ]

        read_only_fields = [
            "id",
        ]


# ==========================================================
# Diagnostic Test Serializer
# ==========================================================

class DiagnosticTestSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:

        model = DiagnosticTest

        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "price",
            "preparation",
            "duration",
            "description",
            "is_available",
        ]

        read_only_fields = [
            "id",
        ]


# ==========================================================
# Test Booking Serializer
# ==========================================================

class TestBookingSerializer(serializers.ModelSerializer):

    booking_number = serializers.ReadOnlyField()

    patient_name = serializers.SerializerMethodField()

    booking_person_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    test_name = serializers.CharField(
        source="diagnostic_test.name",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="diagnostic_test.category.name",
        read_only=True,
    )

    test_price = serializers.DecimalField(
        source="diagnostic_test.price",
        max_digits=8,
        decimal_places=2,
        read_only=True,
    )

    status = serializers.ReadOnlyField()

    payment_status = serializers.SerializerMethodField()

    is_paid = serializers.SerializerMethodField()

    paid_amount = serializers.SerializerMethodField()

    remaining_amount = serializers.SerializerMethodField()

    report_available_at = serializers.ReadOnlyField()

    report_available_note = serializers.ReadOnlyField()

    refund_payment_id = serializers.SerializerMethodField()

    refund_request_status = serializers.SerializerMethodField()

    can_request_refund = serializers.SerializerMethodField()

    diagnostic_result = serializers.SerializerMethodField()

    prescription = serializers.SerializerMethodField()

    report_file_url = serializers.SerializerMethodField()

    class Meta:

        model = TestBooking

        fields = [
            "id",
            "booking_number",

            "patient",
            "patient_name",
            "booking_person_name",
            "appointment",
            "doctor_name",

            "family_member",

            "diagnostic_test",
            "test_name",
            "category_name",
            "test_price",

            "booking_date",
            "booking_time",
            "report_available_at",
            "report_available_note",

            "status",

            "payment_status",
            "is_paid",
            "paid_amount",
            "remaining_amount",

            "refund_payment_id",
            "refund_request_status",
            "can_request_refund",

            "diagnostic_result",
            "prescription",
            "report_file_url",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "booking_number",

            "patient",
            "patient_name",

            "test_name",
            "category_name",
            "test_price",

            "status",
            "created_at",
        ]

    # ======================================================
    # Patient / Booking Person Name
    # ======================================================

    def get_patient_name(self, obj):

        # --------------------------------------------------
        # Family Member Booking
        # --------------------------------------------------

        if obj.family_member:

            return obj.family_member.name

        # --------------------------------------------------
        # Self Booking
        # --------------------------------------------------

        full_name = (
            obj.patient.user
            .get_full_name()
            .strip()
        )

        if full_name:

            return full_name

        return obj.patient.user.username

    def get_booking_person_name(self, obj):
        return self.get_patient_name(obj)

    def get_doctor_name(self, obj):
        if not obj.appointment or not obj.appointment.doctor:
            return None
        return obj.appointment.doctor.user.get_full_name() or obj.appointment.doctor.user.username

    def _successful_paid_amount(self, obj):
        return obj.payments.filter(
            payment_status__in=["Paid", "Partially Paid"]
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

    def get_payment_status(self, obj):
        paid_amount = self._successful_paid_amount(obj)
        total_amount = Decimal(obj.diagnostic_test.price)
        if paid_amount >= total_amount:
            return "Paid"
        if paid_amount > Decimal("0.00"):
            return "Partially Paid"
        latest = obj.payments.order_by("-payment_date", "-id").first()
        return latest.payment_status if latest else "Unpaid"

    def get_is_paid(self, obj):
        return self._successful_paid_amount(obj) >= Decimal(obj.diagnostic_test.price)

    def get_paid_amount(self, obj):
        return self._successful_paid_amount(obj)

    def get_remaining_amount(self, obj):
        remaining = Decimal(obj.diagnostic_test.price) - self._successful_paid_amount(obj)
        return max(remaining, Decimal("0.00"))

    def _full_payment(self, obj):
        return obj.payments.filter(
            payment_status="Paid",
            payment_mode="Full",
        ).order_by("-payment_date", "-id").first()

    def get_refund_payment_id(self, obj):
        payment = self._full_payment(obj)
        return payment.id if payment else None

    def get_refund_request_status(self, obj):
        payment = self._full_payment(obj)
        if not payment:
            return None
        request = payment.refund_requests.order_by("-requested_at").first()
        return request.refund_status if request else None

    def get_can_request_refund(self, obj):
        payment = self._full_payment(obj)
        if not payment or not payment.can_be_refunded:
            return False
        return not payment.refund_requests.filter(
            refund_status__in=["Pending", "Approved", "Completed"]
        ).exists()

    def _published_report(self, obj):
        report = getattr(obj, "medical_report", None)
        if not report or report.report_status != "Published":
            return None
        return report

    def get_diagnostic_result(self, obj):
        report = self._published_report(obj)
        return report.diagnostic_result if report else ""

    def get_prescription(self, obj):
        report = self._published_report(obj)
        return report.prescription if report else ""

    def get_report_file_url(self, obj):
        report = self._published_report(obj)
        if not report or not report.report_file:
            return None
        request = self.context.get("request")
        url = report.report_file.url
        return request.build_absolute_uri(url) if request else url

    # ======================================================
    # Validation
    # ======================================================

    def validate(self, data):

        request = self.context.get("request")

        # ==================================================
        # Authentication
        # ==================================================

        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({

                "authentication":
                "Authentication is required."

            })

        # ==================================================
        # Patient Profile
        # ==================================================

        try:

            patient = request.user.patient_profile

        except Exception:

            raise serializers.ValidationError({

                "patient":
                (
                    "Patient profile not found. "
                    "Please complete your profile first."
                )

            })

        # ==================================================
        # Submitted Data
        # ==================================================

        family_member = data.get(
            "family_member"
        )

        appointment = data.get("appointment")

        diagnostic_test = data.get(
            "diagnostic_test"
        )

        booking_date = data.get(
            "booking_date"
        )

        booking_time = data.get(
            "booking_time"
        )

        # ==================================================
        # Required Fields
        # ==================================================

        if not diagnostic_test:

            raise serializers.ValidationError({

                "diagnostic_test":
                "Diagnostic test is required."

            })

        if not booking_date:

            raise serializers.ValidationError({

                "booking_date":
                "Booking date is required."

            })

        if not booking_time:

            raise serializers.ValidationError({

                "booking_time":
                "Booking time is required."

            })

        if appointment:
            if appointment.patient_id != patient.id:
                raise serializers.ValidationError({"appointment": "This appointment does not belong to your account."})
            if appointment.status not in ["Confirmed", "Completed"]:
                raise serializers.ValidationError({"appointment": "Choose a confirmed or completed appointment."})

        # ==================================================
        # Past Date
        # ==================================================

        if booking_date < timezone.localdate():

            raise serializers.ValidationError({

                "booking_date":
                "Past date booking is not allowed."

            })

        # ==================================================
        # Test Availability
        # ==================================================

        if not diagnostic_test.is_available:

            raise serializers.ValidationError({

                "diagnostic_test":
                "This diagnostic test is currently unavailable."

            })

        # ==================================================
        # Category Availability
        # ==================================================

        if not diagnostic_test.category.is_active:

            raise serializers.ValidationError({

                "diagnostic_test":
                "This test category is currently inactive."

            })

        # ==================================================
        # Family Member Ownership
        # ==================================================

        if family_member:

            if family_member.patient_id != patient.id:

                raise serializers.ValidationError({

                    "family_member":
                    (
                        "This family member does not belong "
                        "to your account."
                    )

                })

        # ==================================================
        # Duplicate Booking
        # ==================================================
        #
        # Same:
        #   Patient
        #   Diagnostic Test
        #   Booking Date
        #   Booking Person
        #
        # is not allowed.
        #
        # Cancelled booking is ignored.
        # ==================================================

        existing_booking = TestBooking.objects.filter(

            patient=patient,

            diagnostic_test=diagnostic_test,

            booking_date=booking_date,

        ).exclude(

            status="Cancelled"

        )

        # --------------------------------------------------
        # Booking For Family Member
        # --------------------------------------------------

        if family_member:

            existing_booking = existing_booking.filter(

                family_member=family_member

            )

        # --------------------------------------------------
        # Booking For Myself
        # --------------------------------------------------

        else:

            existing_booking = existing_booking.filter(

                family_member__isnull=True

            )

        # --------------------------------------------------
        # Update Support
        # --------------------------------------------------

        if self.instance:

            existing_booking = (
                existing_booking
                .exclude(
                    pk=self.instance.pk
                )
            )

        # --------------------------------------------------
        # Duplicate Found
        # --------------------------------------------------

        if existing_booking.exists():

            if family_member:

                raise serializers.ValidationError({

                    "non_field_errors": [

                        (
                            "This diagnostic test is already "
                            "booked for this family member "
                            "on the selected date."
                        )

                    ]

                })

            else:

                raise serializers.ValidationError({

                    "non_field_errors": [

                        (
                            "This diagnostic test is already "
                            "booked for you on the selected date."
                        )

                    ]

                })

        return data