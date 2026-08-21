from rest_framework import serializers
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

    # ------------------------------------------------------
    # Read-only information
    # ------------------------------------------------------

    booking_number = serializers.ReadOnlyField()

    patient_name = serializers.SerializerMethodField()

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

    # ------------------------------------------------------
    # Meta
    # ------------------------------------------------------

    class Meta:

        model = TestBooking

        fields = [
            "id",
            "booking_number",

            "patient",
            "patient_name",

            "family_member",

            "diagnostic_test",
            "test_name",
            "category_name",
            "test_price",

            "booking_date",
            "booking_time",

            "status",

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
    # Patient Name
    # ======================================================

    def get_patient_name(self, obj):

        if obj.family_member:

            return obj.family_member.name

        full_name = obj.patient.user.get_full_name()

        if full_name:

            return full_name

        return obj.patient.user.username

    # ======================================================
    # Validation
    # ======================================================

    def validate(self, data):

        request = self.context.get("request")

        # --------------------------------------------------
        # Authentication
        # --------------------------------------------------

        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({

                "authentication":
                "Authentication is required."

            })

        # --------------------------------------------------
        # Patient Profile
        # --------------------------------------------------

        if not hasattr(
            request.user,
            "patient_profile"
        ):

            raise serializers.ValidationError({

                "patient":
                "Patient profile not found."

            })

        patient = request.user.patient_profile

        # --------------------------------------------------
        # Get Submitted Data
        # --------------------------------------------------

        family_member = data.get(
            "family_member"
        )

        diagnostic_test = data.get(
            "diagnostic_test"
        )

        booking_date = data.get(
            "booking_date"
        )

        booking_time = data.get(
            "booking_time"
        )

        # --------------------------------------------------
        # Diagnostic Test Required
        # --------------------------------------------------

        if not diagnostic_test:

            raise serializers.ValidationError({

                "diagnostic_test":
                "Diagnostic test is required."

            })

        # --------------------------------------------------
        # Booking Date Required
        # --------------------------------------------------

        if not booking_date:

            raise serializers.ValidationError({

                "booking_date":
                "Booking date is required."

            })

        # --------------------------------------------------
        # Booking Time Required
        # --------------------------------------------------

        if not booking_time:

            raise serializers.ValidationError({

                "booking_time":
                "Booking time is required."

            })

        # --------------------------------------------------
        # Past Date Validation
        # --------------------------------------------------

        if booking_date < timezone.now().date():

            raise serializers.ValidationError({

                "booking_date":
                "Past date booking is not allowed."

            })

        # --------------------------------------------------
        # Diagnostic Test Availability
        # --------------------------------------------------

        if not diagnostic_test.is_available:

            raise serializers.ValidationError({

                "diagnostic_test":
                "This diagnostic test is currently unavailable."

            })

        # --------------------------------------------------
        # Family Member Ownership
        # --------------------------------------------------

        if family_member:

            if family_member.patient_id != patient.id:

                raise serializers.ValidationError({

                    "family_member":
                    "This family member does not belong to you."

                })

        # --------------------------------------------------
        # Duplicate Booking Check
        # --------------------------------------------------

        existing_booking = TestBooking.objects.filter(

            patient=patient,

            diagnostic_test=diagnostic_test,

            booking_date=booking_date,

        ).exclude(

            status="Cancelled"

        )

        if self.instance:

            existing_booking = existing_booking.exclude(

                pk=self.instance.pk

            )

        if existing_booking.exists():

            raise serializers.ValidationError({

                "non_field_errors": [

                    "You already have a booking for this diagnostic test on this date."

                ]

            })

        # --------------------------------------------------
        # Final Validation
        # --------------------------------------------------

        return data