from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

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

            "payment_status",

            "payment_date",

        )

    # =====================================
    # Validation
    # =====================================

    def validate(self, attrs):

        appointment = attrs.get("appointment")

        test_booking = attrs.get("test_booking")

        if not appointment and not test_booking:

            raise serializers.ValidationError({

                "appointment":
                "Appointment or Test Booking is required."

            })

        return attrs