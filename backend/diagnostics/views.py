from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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


# ==========================================================
# Test Category List
# ==========================================================
# GET: /api/diagnostics/categories/
# ==========================================================

class TestCategoryListView(generics.ListAPIView):

    queryset = TestCategory.objects.filter(
        is_active=True
    )

    serializer_class = TestCategorySerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Diagnostic Test List
# ==========================================================
# GET: /api/diagnostics/tests/
# ==========================================================

class DiagnosticTestListView(generics.ListAPIView):

    queryset = DiagnosticTest.objects.filter(
        is_available=True
    ).select_related(
        "category"
    )

    serializer_class = DiagnosticTestSerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Diagnostic Test Details
# ==========================================================
# GET: /api/diagnostics/tests/<id>/
# ==========================================================

class DiagnosticTestDetailView(
    generics.RetrieveAPIView
):

    queryset = DiagnosticTest.objects.filter(
        is_available=True
    ).select_related(
        "category"
    )

    serializer_class = DiagnosticTestSerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Book Diagnostic Test
# ==========================================================
# POST: /api/diagnostics/book/
# ==========================================================

class TestBookingCreateView(
    generics.CreateAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(self, serializer):

        patient = self.request.user.patient_profile

        # --------------------------------------------------
        # Automatically assign logged-in patient
        # --------------------------------------------------

        serializer.save(
            patient=patient
        )

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

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
                "data": response.data,
            },
            status=status.HTTP_201_CREATED,
        )


# ==========================================================
# My Diagnostic Test Bookings
# ==========================================================
# GET: /api/diagnostics/bookings/
# ==========================================================

class MyTestBookingListView(
    generics.ListAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            return TestBooking.objects.none()

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
# Booking Details
# ==========================================================
# GET: /api/diagnostics/bookings/<id>/
# ==========================================================

class TestBookingDetailView(
    generics.RetrieveAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

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
# ==========================================================
# PATCH: /api/diagnostics/bookings/<id>/cancel/
# ==========================================================

class TestBookingCancelView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        pk
    ):

        booking = get_object_or_404(
            TestBooking,
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
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # Cancel Booking
        # --------------------------------------------------

        booking.status = "Cancelled"

        booking.save(
            update_fields=[
                "status"
            ]
        )

        return Response(
            {
                "success": True,
                "message":
                    "Diagnostic test booking cancelled successfully.",
                "booking_number":
                    booking.booking_number,
                "status":
                    booking.status,
            },
            status=status.HTTP_200_OK,
        )