from django.db import (
    IntegrityError,
    transaction,
)

from django.shortcuts import (
    get_object_or_404,
)

from rest_framework import (
    generics,
    status,
)

from rest_framework.exceptions import (
    ValidationError,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from rest_framework.views import (
    APIView,
)

from .models import (
    Payment,
)

from .serializers import (
    PaymentSerializer,
)

from notifications.models import (
    Notification,
)


# ==========================================================
# Helper Function
# Payment Success Notification
# ==========================================================

def create_payment_notification(
    payment
):

    # ======================================================
    # Prevent Duplicate Notification
    # ======================================================

    if payment.payment_notification_sent:

        return False


    # ======================================================
    # Payment Source
    # ======================================================

    if payment.appointment:

        service_name = (
            "doctor appointment"
        )

    elif payment.test_booking:

        service_name = (
            "diagnostic test"
        )

    else:

        service_name = (
            "healthcare service"
        )


    # ======================================================
    # Create Notification
    # ======================================================

    Notification.objects.create(

        user=payment.patient.user,

        notification_type="Payment",

        title="Payment Successful",

        message=(
            f"Your payment of BDT "
            f"{payment.amount} "
            f"for {service_name} "
            f"has been completed successfully."
        ),

        is_read=False,

    )


    return True


# ==========================================================
# Helper Function
# Payment Refund Notification
# ==========================================================

def create_refund_notification(
    payment
):

    if payment.appointment:

        service_name = (
            "doctor appointment"
        )

    elif payment.test_booking:

        service_name = (
            "diagnostic test"
        )

    else:

        service_name = (
            "healthcare service"
        )


    Notification.objects.create(

        user=payment.patient.user,

        notification_type="Payment",

        title="Payment Refunded",

        message=(
            f"Your payment of BDT "
            f"{payment.amount} "
            f"for {service_name} "
            f"has been refunded successfully."
        ),

        is_read=False,

    )


# ==========================================================
# Create Payment
#
# POST:
# /api/payments/create/
# ==========================================================

class PaymentCreateView(
    generics.CreateAPIView
):

    serializer_class = PaymentSerializer

    permission_classes = [
        IsAuthenticated
    ]


    # ======================================================
    # Create Payment
    # ======================================================

    def perform_create(
        self,
        serializer
    ):

        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            raise ValidationError({

                "patient":
                "Patient profile not found."

            })


        # ==================================================
        # Create Payment Directly As Paid
        #
        # Because this project currently uses
        # Transaction ID based simulated payment.
        # ==================================================

        payment = serializer.save(

            patient=(
                self.request.user
                .patient_profile
            ),

            payment_status="Paid",

        )


        # ==================================================
        # Payment Notification
        # ==================================================

        notification_created = (
            create_payment_notification(
                payment
            )
        )


        # ==================================================
        # Mark Notification As Sent
        # ==================================================

        if notification_created:

            payment.payment_notification_sent = (
                True
            )

            payment.save(

                update_fields=[

                    "payment_notification_sent",

                    "updated_at",

                ]

            )


    # ======================================================
    # Create Response
    # ======================================================

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        # ==================================================
        # Patient Profile Check
        # ==================================================

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

                status=(
                    status.HTTP_403_FORBIDDEN
                )

            )


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
                    "Payment completed successfully.",

                    "data":
                    response.data,

                },

                status=(
                    status.HTTP_201_CREATED
                )

            )


        except IntegrityError:

            return Response(

                {

                    "success": False,

                    "message":
                    (
                        "Transaction ID already exists."
                    ),

                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                )

            )


# ==========================================================
# My Payment History
#
# GET:
# /api/payments/
# ==========================================================

class PaymentListView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [

        IsAuthenticated,

    ]


    def get_queryset(
        self
    ):

        user = (
            self.request.user
        )


        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            user,
            "patient_profile",
        ):

            return (
                Payment.objects.none()
            )


        # ==================================================
        # Patient Payments
        # ==================================================

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

                patient=(
                    user.patient_profile
                )

            )

            .order_by(

                "-payment_date"

            )

        )


# ==========================================================
# Payment Details
#
# GET:
# /api/payments/<id>/
# ==========================================================

class PaymentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [

        IsAuthenticated,

    ]


    def get_queryset(
        self
    ):

        user = (
            self.request.user
        )


        # ==================================================
        # Patient Profile Check
        # ==================================================

        if not hasattr(
            user,
            "patient_profile",
        ):

            return (
                Payment.objects.none()
            )


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

                patient=(
                    user.patient_profile
                )

            )

        )


# ==========================================================
# Admin Payment List
#
# GET:
# /api/payments/admin/
# ==========================================================

class AdminPaymentListView(
    generics.ListAPIView
):

    serializer_class = (
        PaymentSerializer
    )

    permission_classes = [

        IsAuthenticated,

    ]


    def get_queryset(
        self
    ):

        # ==================================================
        # Admin Check
        # ==================================================

        if not (
            self.request.user.is_staff
        ):

            return (
                Payment.objects.none()
            )


        # ==================================================
        # All Payments
        # ==================================================

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

            .order_by(

                "-payment_date"

            )

        )


# ==========================================================
# Update Payment Status
#
# PATCH:
# /api/payments/<id>/status/
#
# Only Admin
# ==========================================================

class PaymentStatusUpdateView(
    APIView
):

    permission_classes = [

        IsAuthenticated,

    ]


    # ======================================================
    # Valid Status
    # ======================================================

    VALID_STATUS = [

        "Pending",

        "Paid",

        "Failed",

    ]


    # ======================================================
    # Status Transitions
    # ======================================================

    STATUS_TRANSITIONS = {

        "Pending": [

            "Paid",

            "Failed",

        ],

        "Failed": [

            "Pending",

            "Paid",

        ],

        "Paid": [],

        "Refunded": [],

    }


    # ======================================================
    # Update Status
    # ======================================================

    def patch(
        self,
        request,
        pk
    ):

        # ==================================================
        # Admin Check
        # ==================================================

        if not request.user.is_staff:

            return Response(

                {

                    "success": False,

                    "message":
                    "Admin access required.",

                },

                status=(
                    status.HTTP_403_FORBIDDEN
                ),

            )


        # ==================================================
        # New Status
        # ==================================================

        new_status = (
            request.data.get(
                "payment_status"
            )
        )


        # ==================================================
        # Validate Status
        # ==================================================

        if new_status not in self.VALID_STATUS:

            return Response(

                {

                    "success": False,

                    "message":
                    "Invalid payment status.",

                    "valid_statuses":
                    self.VALID_STATUS,

                },

                status=(
                    status.HTTP_400_BAD_REQUEST
                ),

            )


        # ==================================================
        # Database Transaction
        # ==================================================

        with transaction.atomic():

            payment = (
                get_object_or_404(

                    Payment.objects

                    .select_related(

                        "patient",

                        "patient__user",

                        "appointment",

                        "test_booking",

                    )

                    .select_for_update(),

                    pk=pk,

                )
            )


            previous_status = (
                payment.payment_status
            )


            # ==================================================
            # Same Status
            # ==================================================

            if previous_status == new_status:

                return Response(

                    {

                        "success": True,

                        "message":
                        "Payment already has this status.",

                        "payment":
                        PaymentSerializer(
                            payment
                        ).data,

                    },

                    status=(
                        status.HTTP_200_OK
                    ),

                )


            # ==================================================
            # Refunded Protection
            # ==================================================

            if previous_status == "Refunded":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Refunded payment cannot "
                            "be modified."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Paid Protection
            # ==================================================

            if previous_status == "Paid":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Paid payment cannot be "
                            "modified from this endpoint. "
                            "Use the refund endpoint "
                            "for refunds."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Validate Transition
            # ==================================================

            allowed_statuses = (

                self.STATUS_TRANSITIONS.get(

                    previous_status,

                    []

                )

            )


            if new_status not in allowed_statuses:

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            f"Cannot change payment "
                            f"status from "
                            f"{previous_status} "
                            f"to "
                            f"{new_status}."
                        ),

                        "allowed_statuses":
                        allowed_statuses,

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Update Status
            # ==================================================

            payment.payment_status = (
                new_status
            )


            # ==================================================
            # Payment Notification
            #
            # This is useful for old Pending payments
            # which admin later marks as Paid.
            # ==================================================

            if (

                new_status == "Paid"

                and

                previous_status != "Paid"

            ):

                notification_created = (

                    create_payment_notification(
                        payment
                    )

                )


                if notification_created:

                    payment.payment_notification_sent = (
                        True
                    )


            # ==================================================
            # Save
            # ==================================================

            payment.save(

                update_fields=[

                    "payment_status",

                    "payment_notification_sent",

                    "updated_at",

                ]

            )


        # ==================================================
        # Success Response
        # ==================================================

        return Response(

            {

                "success": True,

                "message":
                (
                    "Payment status updated "
                    "successfully."
                ),

                "payment":
                PaymentSerializer(
                    payment
                ).data,

            },

            status=(
                status.HTTP_200_OK
            ),

        )


# ==========================================================
# Refund Payment
#
# PATCH:
# /api/payments/<id>/refund/
# ==========================================================

class PaymentRefundView(
    APIView
):

    permission_classes = [

        IsAuthenticated,

    ]


    # ======================================================
    # Refund Payment
    # ======================================================

    def patch(
        self,
        request,
        pk
    ):

        # ==================================================
        # Admin Check
        # ==================================================

        if not request.user.is_staff:

            return Response(

                {

                    "success": False,

                    "message":
                    "Admin access required.",

                },

                status=(
                    status.HTTP_403_FORBIDDEN
                ),

            )


        # ==================================================
        # Database Transaction
        # ==================================================

        with transaction.atomic():

            payment = (
                get_object_or_404(

                    Payment.objects

                    .select_related(

                        "patient",

                        "patient__user",

                        "appointment",

                        "test_booking",

                    )

                    .select_for_update(),

                    pk=pk,

                )
            )


            # ==================================================
            # Already Refunded
            # ==================================================

            if payment.payment_status == "Refunded":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "This payment has already "
                            "been refunded."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Payment Must Be Paid
            # ==================================================

            if payment.payment_status != "Paid":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Only successfully paid "
                            "payments can be refunded."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Partial Payment Cannot Be Refunded
            # ==================================================

            if payment.payment_mode == "Partial":

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "Partial payments are "
                            "non-refundable."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Refund Eligibility
            # ==================================================

            if not payment.is_refundable:

                return Response(

                    {

                        "success": False,

                        "message":
                        (
                            "This payment is not "
                            "eligible for refund."
                        ),

                    },

                    status=(
                        status.HTTP_400_BAD_REQUEST
                    ),

                )


            # ==================================================
            # Update Payment Status
            # ==================================================

            payment.payment_status = (
                "Refunded"
            )


            payment.save(

                update_fields=[

                    "payment_status",

                    "updated_at",

                ]

            )


            # ==================================================
            # Refund Notification
            # ==================================================

            create_refund_notification(
                payment
            )


        # ==================================================
        # Success Response
        # ==================================================

        return Response(

            {

                "success": True,

                "message":
                (
                    "Payment refunded successfully."
                ),

                "payment":
                PaymentSerializer(
                    payment
                ).data,

            },

            status=(
                status.HTTP_200_OK
            ),

        )