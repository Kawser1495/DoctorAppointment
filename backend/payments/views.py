from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer


# ==========================================================
# Create Payment
# POST: /api/payments/create/
# ==========================================================

class PaymentCreateView(generics.CreateAPIView):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(
            patient=self.request.user.patient_profile
        )

    def create(self, request, *args, **kwargs):

        response = super().create(request, *args, **kwargs)

        return Response(
            {
                "success": True,
                "message": "Payment created successfully.",
                "data": response.data
            },
            status=status.HTTP_201_CREATED
        )


# ==========================================================
# My Payment History
# GET: /api/payments/my/
# ==========================================================

class PaymentListView(generics.ListAPIView):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Payment.objects.filter(
            patient=self.request.user.patient_profile
        ).order_by("-payment_date")


# ==========================================================
# Payment Details
# GET: /api/payments/<id>/
# ==========================================================

class PaymentDetailView(generics.RetrieveAPIView):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Payment.objects.filter(
            patient=self.request.user.patient_profile
        )


# ==========================================================
# Payment Status Update
# PATCH: /api/payments/<id>/status/
# ==========================================================

class PaymentStatusUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    VALID_STATUS = [
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
    ]

    def patch(self, request, pk):

        payment = get_object_or_404(
            Payment,
            pk=pk
        )

        payment_status = request.data.get(
            "payment_status"
        )

        if payment_status not in self.VALID_STATUS:

            return Response(
                {
                    "success": False,
                    "message": "Invalid payment status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        payment.payment_status = payment_status

        payment.save(
            update_fields=["payment_status"]
        )

        return Response(
            {
                "success": True,
                "message": "Payment status updated successfully.",
                "payment_status": payment.payment_status
            },
            status=status.HTTP_200_OK
        )