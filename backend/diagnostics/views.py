from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    TestCategory,
    DiagnosticTest,
    TestBooking,
)

from .serializers import (
    TestCategorySerializer,
    DiagnosticTestSerializer,
    TestBookingSerializer,
)

from notifications.models import Notification


# ==========================================================
# Test Category List
#
# GET:
# /api/tests/categories/
# ==========================================================

class TestCategoryListView(
    generics.ListAPIView
):

    queryset = (
        TestCategory.objects
        .filter(
            is_active=True
        )
        .order_by(
            "name"
        )
    )

    serializer_class = TestCategorySerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Diagnostic Test List
#
# GET:
# /api/tests/tests/
#
# Optional:
#
# ?category=1
# ?search=blood
# ==========================================================

class DiagnosticTestListView(
    generics.ListAPIView
):

    serializer_class = DiagnosticTestSerializer

    permission_classes = [
        AllowAny
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]

    filterset_fields = [
        "category",
    ]

    search_fields = [
        "name",
        "description",
        "preparation",
        "category__name",
    ]

    def get_queryset(self):

        return (
            DiagnosticTest.objects
            .filter(
                is_available=True,
                category__is_active=True,
            )
            .select_related(
                "category",
            )
            .order_by(
                "name",
            )
        )


# ==========================================================
# Diagnostic Test Details
#
# GET:
# /api/tests/tests/<id>/
# ==========================================================

class DiagnosticTestDetailView(
    generics.RetrieveAPIView
):

    serializer_class = DiagnosticTestSerializer

    permission_classes = [
        AllowAny
    ]

    def get_queryset(self):

        return (
            DiagnosticTest.objects
            .filter(
                is_available=True,
                category__is_active=True,
            )
            .select_related(
                "category",
            )
        )


# ==========================================================
# Book Diagnostic Test
#
# POST:
# /api/tests/book/
# ==========================================================

class TestBookingCreateView(
    generics.CreateAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    # ======================================================
    # Save Booking
    # ======================================================

    def perform_create(
        self,
        serializer
    ):

        # --------------------------------------------------
        # Patient Profile Check
        # --------------------------------------------------

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            from rest_framework.exceptions import (
                ValidationError
            )

            raise ValidationError({

                "patient":
                (
                    "Patient profile not found. "
                    "Please complete your profile first."
                )

            })

        # --------------------------------------------------
        # Get Patient
        # --------------------------------------------------

        patient = (
            self.request.user.patient_profile
        )

        # --------------------------------------------------
        # Create Booking + Notification
        # in the same transaction
        # --------------------------------------------------

        with transaction.atomic():

            booking = serializer.save(
                patient=patient
            )

            # --------------------------------------------------
            # IMPORTANT:
            # Notification model supports:
            #
            # Appointment
            # Payment
            # Report
            # Diagnostic
            # General
            #
            # Therefore use "Diagnostic",
            # NOT "Diagnostic Booking".
            # --------------------------------------------------

            Notification.objects.create(

                user=self.request.user,

                notification_type="Diagnostic",

                title=(
                    "Diagnostic Test Booking Successful"
                ),

                message=(

                    f"Your diagnostic test "
                    f"'{booking.diagnostic_test.name}' "
                    f"has been booked successfully. "

                    f"Booking Number: "
                    f"{booking.booking_number}. "

                    f"Booking Date: "
                    f"{booking.booking_date}. "

                    f"Booking Time: "
                    f"{booking.booking_time}."

                ),

                is_read=False,

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
                    (
                        "Patient profile not found. "
                        "Please complete your profile first."
                    ),

                },

                status=status.HTTP_403_FORBIDDEN,

            )

        # --------------------------------------------------
        # Create Booking
        # --------------------------------------------------

        response = super().create(
            request,
            *args,
            **kwargs
        )

        return Response(

            {

                "success": True,

                "message":
                "Diagnostic test booked successfully.",

                "data":
                response.data,

            },

            status=status.HTTP_201_CREATED,

        )


# ==========================================================
# My Diagnostic Test Bookings
#
# GET:
# /api/tests/bookings/
# ==========================================================

class MyTestBookingListView(
    generics.ListAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        # --------------------------------------------------
        # Patient Profile Check
        # --------------------------------------------------

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            return TestBooking.objects.none()

        # --------------------------------------------------
        # Patient's Own Bookings
        # --------------------------------------------------

        return (

            TestBooking.objects

            .select_related(

                "patient",

                "patient__user",

                "family_member",

                "diagnostic_test",

                "diagnostic_test__category",

            )

            .filter(

                patient=self.request.user.patient_profile

            )

            .order_by(

                "-booking_date",

                "-booking_time",

                "-created_at",

            )

        )


# ==========================================================
# Test Booking Details
#
# GET:
# /api/tests/bookings/<id>/
# ==========================================================

class TestBookingDetailView(
    generics.RetrieveAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        # --------------------------------------------------
        # Patient Profile Check
        # --------------------------------------------------

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            return TestBooking.objects.none()

        # --------------------------------------------------
        # Only Own Booking
        # --------------------------------------------------

        return (

            TestBooking.objects

            .select_related(

                "patient",

                "patient__user",

                "family_member",

                "diagnostic_test",

                "diagnostic_test__category",

            )

            .filter(

                patient=self.request.user.patient_profile

            )

        )


# ==========================================================
# Cancel Diagnostic Test Booking
#
# PATCH:
# /api/tests/bookings/<id>/cancel/
# ==========================================================

class TestBookingCancelView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        pk
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
                    (
                        "Patient profile not found. "
                        "Please complete your profile first."
                    ),

                },

                status=status.HTTP_403_FORBIDDEN,

            )

        # --------------------------------------------------
        # Get Own Booking
        # --------------------------------------------------

        booking = get_object_or_404(

            TestBooking.objects.select_related(

                "patient",

                "patient__user",

                "family_member",

                "diagnostic_test",

                "diagnostic_test__category",

            ),

            pk=pk,

            patient=request.user.patient_profile,

        )

        # --------------------------------------------------
        # Already Cancelled
        # --------------------------------------------------

        if booking.status == "Cancelled":

            return Response(

                {

                    "success": False,

                    "message":
                    "Booking is already cancelled.",

                    "booking_number":
                    booking.booking_number,

                    "status":
                    booking.status,

                },

                status=status.HTTP_400_BAD_REQUEST,

            )

        # --------------------------------------------------
        # Completed Booking
        # --------------------------------------------------

        if booking.status == "Completed":

            return Response(

                {

                    "success": False,

                    "message":
                    "Completed booking cannot be cancelled.",

                    "booking_number":
                    booking.booking_number,

                    "status":
                    booking.status,

                },

                status=status.HTTP_400_BAD_REQUEST,

            )

        # --------------------------------------------------
        # Cancel Booking + Notification
        # --------------------------------------------------

        with transaction.atomic():

            booking.status = "Cancelled"

            booking.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            # --------------------------------------------------
            # Cancellation Notification
            # --------------------------------------------------

            Notification.objects.create(

                user=request.user,

                notification_type="Diagnostic",

                title=(
                    "Diagnostic Test Booking Cancelled"
                ),

                message=(

                    f"Your diagnostic test booking "
                    f"'{booking.diagnostic_test.name}' "
                    f"has been cancelled. "

                    f"Booking Number: "
                    f"{booking.booking_number}. "

                    f"Booking Date: "
                    f"{booking.booking_date}. "

                    f"Booking Time: "
                    f"{booking.booking_time}."

                ),

                is_read=False,

            )

        # --------------------------------------------------
        # Success Response
        # --------------------------------------------------

        return Response(

            {

                "success": True,

                "message":
                (
                    "Diagnostic test booking "
                    "cancelled successfully."
                ),

                "data": {

                    "id":
                    booking.id,

                    "booking_number":
                    booking.booking_number,

                    "test_name":
                    booking.diagnostic_test.name,

                    "booking_date":
                    booking.booking_date,

                    "booking_time":
                    booking.booking_time,

                    "status":
                    booking.status,

                },

            },

            status=status.HTTP_200_OK,

        )