from rest_framework import generics
from .models import TestBooking
from .serializers import TestBookingSerializer

class TestBookingCreateView(generics.CreateAPIView):
    queryset = TestBooking.objects.all()
    serializer_class = TestBookingSerializer
