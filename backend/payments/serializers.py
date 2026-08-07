from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.user.get_full_name",
        read_only=True,
    )

    doctor_name = serializers.CharField(
        source="appointment.doctor.user.get_full_name",
        read_only=True,
    )

    booking_number = serializers.CharField(
        source="appointment.booking_number",
        read_only=True,
    )

    class Meta:
        model = Payment

        fields = [
            "id",
            "patient",
            "patient_name",
            "appointment",
            "booking_number",
            "doctor_name",
            "amount",
            "payment_method",
            "transaction_id",
            "payment_status",
            "payment_date",
        ]

        read_only_fields = [
            "patient",
            "payment_date",
        ]

    def create(self, validated_data):

        validated_data["patient"] = (
            self.context["request"].user.patient_profile
        )

        return super().create(validated_data)