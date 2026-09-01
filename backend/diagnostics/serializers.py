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