from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    # ==========================================================
    # Read-Only Information
    # ==========================================================

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True
    )

    appointment_booking = serializers.SerializerMethodField(
        read_only=True
    )

    doctor_name = serializers.SerializerMethodField(
        read_only=True
    )

    # ==========================================================
    # Meta
    # ==========================================================

    class Meta:

        model = Payment

        fields = [

            "id",

            # Patient
            "patient",
            "patient_name",

            # Appointment
            "appointment",
            "appointment_booking",
            "doctor_name",

            # Diagnostic Test
            "test_booking",

            # Payment Information
            "amount",
            "payment_method",
            "transaction_id",
            "payment_status",
            "payment_date",

        ]

        read_only_fields = [

            "id",

            "patient",
            "patient_name",

            "appointment_booking",
            "doctor_name",

            "payment_status",
            "payment_date",

        ]

    # ==========================================================
    # Appointment Booking Number
    # ==========================================================

    def get_appointment_booking(self, obj):

        if obj.appointment:

            return obj.appointment.booking_number

        return None

    # ==========================================================
    # Doctor Name
    # ==========================================================

    def get_doctor_name(self, obj):

        if obj.appointment:

            return obj.appointment.doctor.user.get_full_name()

        return None

    # ==========================================================
    # Validation
    # ==========================================================

    def validate(self, attrs):

        request = self.context.get("request")

        appointment = attrs.get("appointment")
        test_booking = attrs.get("test_booking")
        amount = attrs.get("amount")

        # ======================================================
        # Authentication Check
        # ======================================================

        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({

                "authentication":
                "Authentication is required."

            })

        # ======================================================
        # Patient Profile Check
        # ======================================================

        if not hasattr(
            request.user,
            "patient_profile"
        ):

            raise serializers.ValidationError({

                "patient":
                "Patient profile not found."

            })

        patient = request.user.patient_profile

        # ======================================================
        # Exactly ONE Payment Source Required
        # ======================================================

        if not appointment and not test_booking:

            raise serializers.ValidationError({

                "payment_for":
                "Either an appointment or a test booking is required."

            })

        # ======================================================
        # Cannot Pay for Both
        # ======================================================

        if appointment and test_booking:

            raise serializers.ValidationError({

                "payment_for":
                "Payment can be made for either an appointment or a test booking, not both."

            })

        # ======================================================
        # Amount Validation
        # ======================================================

        if amount is None:

            raise serializers.ValidationError({

                "amount":
                "Payment amount is required."

            })

        if amount <= 0:

            raise serializers.ValidationError({

                "amount":
                "Payment amount must be greater than zero."

            })

        # ======================================================
        # Appointment Payment
        # ======================================================

        if appointment:

            # --------------------------------------------------
            # Ownership
            # --------------------------------------------------

            if appointment.patient_id != patient.id:

                raise serializers.ValidationError({

                    "appointment":
                    "You cannot make payment for another patient's appointment."

                })

            # --------------------------------------------------
            # Appointment Status
            # --------------------------------------------------

            if appointment.status in [
                "Cancelled",
                "Rejected",
                "No Show",
            ]:

                raise serializers.ValidationError({

                    "appointment":
                    "Payment cannot be made for this appointment."

                })

            # --------------------------------------------------
            # Duplicate Payment
            # --------------------------------------------------

            existing_payment = Payment.objects.filter(

                appointment=appointment

            ).exists()

            if existing_payment:

                raise serializers.ValidationError({

                    "appointment":
                    "A payment already exists for this appointment."

                })

            # --------------------------------------------------
            # Correct Amount
            # --------------------------------------------------

            expected_amount = appointment.doctor.consultation_fee

            if amount != expected_amount:

                raise serializers.ValidationError({

                    "amount":
                    f"Payment amount must be exactly {expected_amount}."

                })

        # ======================================================
        # Diagnostic Test Payment
        # ======================================================

        if test_booking:

            # --------------------------------------------------
            # Ownership
            # --------------------------------------------------

            if test_booking.patient_id != patient.id:

                raise serializers.ValidationError({

                    "test_booking":
                    "You cannot make payment for another patient's test booking."

                })

            # --------------------------------------------------
            # Test Booking Status
            # --------------------------------------------------

            if test_booking.status == "Cancelled":

                raise serializers.ValidationError({

                    "test_booking":
                    "Payment cannot be made for a cancelled test booking."

                })

            # --------------------------------------------------
            # Duplicate Payment
            # --------------------------------------------------

            existing_payment = Payment.objects.filter(

                test_booking=test_booking

            ).exists()

            if existing_payment:

                raise serializers.ValidationError({

                    "test_booking":
                    "A payment already exists for this test booking."

                })

            # --------------------------------------------------
            # Correct Amount
            # --------------------------------------------------

            expected_amount = (
                test_booking.diagnostic_test.price
            )

            if amount != expected_amount:

                raise serializers.ValidationError({

                    "amount":
                    f"Payment amount must be exactly {expected_amount}."

                })

        # ======================================================
        # Final Validation
        # ======================================================

        return attrs