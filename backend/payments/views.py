from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(generics.CreateAPIView):

    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class PaymentListView(generics.ListAPIView):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            patient=self.request.user.patient_profile
        )
