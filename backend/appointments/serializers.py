from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

    def validate(self, data):
        appointment_date = data['appointment_date']
        time_slot = data['time_slot']

        if Appointment.objects.filter(
            appointment_date=appointment_date,
            time_slot=time_slot
        ).exists():
            raise serializers.ValidationError(
                "This slot is already booked."
            )

        return data