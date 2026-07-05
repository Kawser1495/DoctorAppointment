from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:

        model = Appointment

        fields = "__all__"

    def validate(self, data):

        doctor = data["doctor"]

        slot = data["slot"]

        appointment_date = data["appointment_date"]

        if Appointment.objects.filter(

            doctor=doctor,

            slot=slot,

            appointment_date=appointment_date

        ).exists():

            raise serializers.ValidationError(

                "This appointment slot is already booked."

            )

        return data