from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer
from notifications.models import Notification


# ==========================================================
# Create Payment
# POST: /api/payments/create/
# ==========================================================

class PaymentCreateView(
    generics.CreateAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # ======================================================
    # Save Payment
    # ======================================================

    def perform_create(self, serializer):

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            from rest_framework.exceptions import ValidationError

            raise ValidationError({

                "patient":
                "Patient profile not found."

            })

        serializer.save(

            patient=self.request.user.patient_profile

        )

    # ======================================================
    # Create Payment
    # ======================================================

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        # --------------------------------------------------
        # Patient Profile Check
        # --------------------------------------------------

        if not hasattr(
            request.user,
            "patient_profile"
        ):

            return Response(

                {
                    "success": False,

                    "message":
                    "Patient profile not found."
                },

                status=status.HTTP_403_FORBIDDEN

            )

        # --------------------------------------------------
        # Database Transaction
        # --------------------------------------------------

        try:

            with transaction.atomic():

                response = super().create(

                    request,
                    *args,
                    **kwargs

                )

            return Response(

                {
                    "success": True,

                    "message":
                    "Payment submitted successfully.",

                    "data":
                    response.data

                },

                status=status.HTTP_201_CREATED

            )

        # --------------------------------------------------
        # Duplicate Transaction ID
        # --------------------------------------------------

        except IntegrityError as error:

            error_message = str(error).lower()

            if (
                "transaction_id" in error_message
                or "unique" in error_message
            ):

                return Response(

                    {
                        "success": False,

                        "message":
                        "This Transaction ID has already been used.",

                        "errors": {
                            "transaction_id": [
                                "This Transaction ID has already been used."
                            ]
                        }

                    },

                    status=status.HTTP_400_BAD_REQUEST

                )

            # ------------------------------------------------
            # Other database error
            # ------------------------------------------------

            return Response(

                {
                    "success": False,

                    "message":
                    "Payment could not be processed.",

                    "errors": {
                        "database": [
                            "A database error occurred while processing the payment."
                        ]
                    }

                },

                status=status.HTTP_400_BAD_REQUEST

            )


# ==========================================================
# My Payment History
# GET: /api/payments/
# ==========================================================

class PaymentListView(
    generics.ListAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(
            user,
            "patient_profile"
        ):

            return Payment.objects.none()

        return (
            Payment.objects
            .select_related(
                "patient",
                "patient__user",
                "appointment",
                "appointment__doctor",
                "appointment__doctor__user",
                "test_booking",
            )
            .filter(
                patient=user.patient_profile
            )
            .order_by(
                "-payment_date"
            )
        )


# ==========================================================
# Payment Details
# GET: /api/payments/<id>/
# ==========================================================

class PaymentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if not hasattr(
            user,
            "patient_profile"
        ):

            return Payment.objects.none()

        return (
            Payment.objects
            .select_related(
                "patient",
                "patient__user",
                "appointment",
                "appointment__doctor",
                "appointment__doctor__user",
                "test_booking",
            )
            .filter(
                patient=user.patient_profile
            )
        )


# ==========================================================
# Admin Payment Management
# GET: /api/payments/admin/
# ==========================================================

class AdminPaymentListView(
    generics.ListAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        if not self.request.user.is_staff:

            return Payment.objects.none()

        return (
            Payment.objects
            .select_related(
                "patient",
                "patient__user",
                "appointment",
                "appointment__doctor",
                "appointment__doctor__user",
                "test_booking",
            )
            .all()
            .order_by(
                "-payment_date"
            )
        )


# ==========================================================
# Payment Status Update
# PATCH: /api/payments/<id>/status/
# ==========================================================

class PaymentStatusUpdateView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    VALID_STATUS = [

        "Pending",
        "Paid",
        "Failed",
        "Refunded"

    ]

    def patch(
        self,
        request,
        pk
    ):

        # --------------------------------------------------
        # Admin Check
        # --------------------------------------------------

        if not request.user.is_staff:

            return Response(

                {
                    "success": False,

                    "message":
                    "Admin access required."
                },

                status=status.HTTP_403_FORBIDDEN

            )

        # --------------------------------------------------
        # Get Payment
        # --------------------------------------------------

        payment = get_object_or_404(

            Payment,
            pk=pk

        )

        # --------------------------------------------------
        # New Status
        # --------------------------------------------------

        new_status = request.data.get(

            "payment_status"

        )

        if new_status not in self.VALID_STATUS:

            return Response(

                {
                    "success": False,

                    "message":
                    "Invalid payment status."
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        # --------------------------------------------------
        # Update
        # --------------------------------------------------

        payment.payment_status = new_status

        payment.save(

            update_fields=[
                "payment_status"
            ]

        )

        return Response(

            {
                "success": True,

                "message":
                "Payment status updated successfully.",

                "payment_id":
                payment.id,

                "payment_status":
                payment.payment_status

            },

            status=status.HTTP_200_OK

        )

        
