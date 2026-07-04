from rest_framework import serializers
from .models import TestBooking

class TestBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestBooking
        fields = '__all__'