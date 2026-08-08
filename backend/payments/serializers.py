from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    # ==========================================
    # Read Only Information
    # ==========================================

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True
    )

    appointment_booking = serializers.CharField(
        source="appointment.booking_number",
        read_only=True
    )

    doctor_name = serializers.CharField(
        source="appointment.doctor.user.get_full_name",
        read_only=True
    )

    # ==========================================
    # Meta
    # ==========================================

    class Meta:

        model = Payment

        fields = [

            "id",

            "patient",
            "patient_name",

            "appointment",
            "appointment_booking",

            "doctor_name",

            "test_booking",

            "amount",

            "payment_method",

            "transaction_id",

            "payment_status",

            "payment_date",

        ]

        read_only_fields = (

            "id",

            "patient",
            "patient_name",

            "appointment_booking",
            "doctor_name",

            "payment_status",

            "payment_date",

        )

    # ==========================================
    # Validation
    # ==========================================

    def validate(self, attrs):

        request = self.context.get("request")

        appointment = attrs.get("appointment")

        test_booking = attrs.get("test_booking")

        # ==========================================
        # Appointment OR Test Booking Required
        # ==========================================

        if not appointment and not test_booking:

            raise serializers.ValidationError({

                "appointment":
                "Appointment or Test Booking is required."

            })

        # ==========================================
        # Check Logged-in Patient
        # ==========================================

        if request and hasattr(
            request.user,
            "patient_profile"
        ):

            patient = request.user.patient_profile

        else:

            raise serializers.ValidationError({

                "patient":
                "Patient profile not found."

            })

        # ==========================================
        # Appointment Ownership Check
        # ==========================================

        if appointment:

            if appointment.patient != patient:

                raise serializers.ValidationError({

                    "appointment":
                    "You cannot make payment for another patient's appointment."

                })

        # ==========================================
        # Duplicate Payment Prevention
        # ==========================================

        if appointment:

            existing_payment = Payment.objects.filter(

                appointment=appointment

            ).exists()

            if existing_payment:

                raise serializers.ValidationError({

                    "appointment":
                    "A payment already exists for this appointment."

                })

        return attrs