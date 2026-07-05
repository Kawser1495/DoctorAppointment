from rest_framework import serializers
from django.utils import timezone

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = "__all__"

    def validate(self, data):

        doctor = data.get("doctor")
        slot = data.get("slot")
        appointment_date = data.get("appointment_date")

        # -----------------------------
        # Required Field Validation
        # -----------------------------
        if not doctor:
            raise serializers.ValidationError(
                {"doctor": "Doctor is required."}
            )

        if not slot:
            raise serializers.ValidationError(
                {"slot": "Time slot is required."}
            )

        if not appointment_date:
            raise serializers.ValidationError(
                {"appointment_date": "Appointment date is required."}
            )

        # -----------------------------
        # Prevent Past Date Booking
        # -----------------------------
        if appointment_date < timezone.now().date():
            raise serializers.ValidationError(
                {
                    "appointment_date":
                    "Past date booking is not allowed."
                }
            )

        # -----------------------------
        # Doctor Availability Check
        # -----------------------------
        if not doctor.is_available:
            raise serializers.ValidationError(
                {
                    "doctor":
                    "This doctor is currently unavailable."
                }
            )

        # -----------------------------
        # Time Slot Active Check
        # -----------------------------
        if not slot.is_active:
            raise serializers.ValidationError(
                {
                    "slot":
                    "Selected time slot is inactive."
                }
            )

        # -----------------------------
        # Slot Capacity Check
        # -----------------------------
        if slot.booked_count >= slot.max_patient:
            raise serializers.ValidationError(
                {
                    "slot":
                    "Selected time slot is already full."
                }
            )

        # -----------------------------
        # Duplicate Appointment Check
        # -----------------------------
        if Appointment.objects.filter(
            doctor=doctor,
            slot=slot,
            appointment_date=appointment_date
        ).exists():

            raise serializers.ValidationError(
                {
                    "slot":
                    "This appointment slot is already booked."
                }
            )

        return data