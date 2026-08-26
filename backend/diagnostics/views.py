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


# ==========================================================
# Test Category List
#
# GET: /api/tests/categories/
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
#
# GET: /api/tests/tests/
#
# Optional:
# ?category=1
# ?search=blood
# ==========================================================

class DiagnosticTestListView(generics.ListAPIView):

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
                category__is_active=True
            )
            .select_related(
                "category"
            )
            .order_by(
                "name"
            )
        )


# ==========================================================
# Diagnostic Test Details
#
# GET: /api/tests/tests/<id>/
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
                category__is_active=True
            )
            .select_related(
                "category"
            )
        )


# ==========================================================
# Book Diagnostic Test
#
# POST: /api/tests/book/
# ==========================================================

class TestBookingCreateView(
    generics.CreateAPIView
):

    serializer_class = TestBookingSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(self, serializer):

        if not hasattr(
            self.request.user,
            "patient_profile"
        ):

            from rest_framework.exceptions import ValidationError

            raise ValidationError({

                "patient":
                "Patient profile not found. Please complete your profile first."

            })

        patient = self.request.user.patient_profile

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
#
# GET: /api/tests/bookings/
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
# Test Booking Details
#
# GET: /api/tests/bookings/<id>/
# ==========================================================

class TestBookingDetailView(
    generics.RetrieveAPIView
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

        )


# ==========================================================
# Cancel Diagnostic Test Booking
#
# PATCH: /api/tests/bookings/<id>/cancel/
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

                status=status.HTTP_400_BAD_REQUEST

            )

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
        # Completed
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
        # Cancel
        # --------------------------------------------------

        booking.status = "Cancelled"

        booking.save(
            update_fields=[
                "status",
                "updated_at",
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