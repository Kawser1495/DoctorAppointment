from django.db import transaction

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


from notifications.models import Notification

from doctors.models import TimeSlot

from patients.models import PatientProfile

from .models import Appointment

from .serializers import (
    AppointmentSerializer
)


# ==========================================================
# Book Appointment
#
# POST:
# /api/appointments/book/
# ==========================================================

class BookAppointmentView(
    generics.CreateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]


    def perform_create(self, serializer):

        try:

            patient = (
                self.request.user.patient_profile
            )

        except AttributeError:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({

                "patient":
                "Patient profile not found. Please complete your profile first."

            })


        # ==================================================
        # Atomic transaction
        #
        # Prevent two users booking the last seat at the same
        # time.
        # ==================================================

        with transaction.atomic():

            slot_id = serializer.validated_data[
                "slot"
            ].id


            slot = TimeSlot.objects.select_for_update().get(

                id=slot_id

            )


            # ==================================================
            # Re-check after locking
            # ==================================================

            if slot.booked_count >= slot.max_patient:

                from rest_framework.exceptions import ValidationError

                raise ValidationError({

                    "slot":
                    "This time slot has just become full."

                })


            # ==================================================
            # Create Appointment
            # ==================================================

            appointment = serializer.save(

                patient=patient,

                status="Pending",

            )


            # ==================================================
            # Create Notification for Patient
            # ==================================================

            doctor_name = (
                appointment.doctor.user.get_full_name()
            )

            if not doctor_name:

                doctor_name = (
                    appointment.doctor.user.username
                )


            Notification.objects.create(

                user=self.request.user,

                notification_type="Appointment",

                title="Appointment Booked Successfully",

                message=(
                    f"Your appointment with Dr. {doctor_name} "
                    f"has been booked successfully. "
                    f"Your appointment is currently pending."
                ),

            )


            # ==================================================
            # Increase booked count
            # ==================================================

            slot.booked_count += 1

            slot.save(

                update_fields=[
                    "booked_count"
                ]

            )


# ==========================================================
# Get My Appointments
#
# GET:
# /api/appointments/patient/
# ==========================================================

class PatientAppointmentListView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]


    def get_queryset(self):

        try:

            patient = (
                self.request.user.patient_profile
            )

        except AttributeError:

            return Appointment.objects.none()


        return Appointment.objects.filter(

            patient=patient

        ).select_related(

            "doctor",

            "doctor__user",

            "doctor__department",

            "slot",

            "family_member",

        )


# ==========================================================
# Appointment Details
#
# GET:
# /api/appointments/<id>/
# ==========================================================

class AppointmentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"


    def get_queryset(self):

        try:

            patient = (
                self.request.user.patient_profile
            )

        except AttributeError:

            return Appointment.objects.none()


        return Appointment.objects.filter(

            patient=patient

        ).select_related(

            "doctor",

            "doctor__user",

            "doctor__department",

            "slot",

            "family_member",

        )


# ==========================================================
# Cancel Appointment
#
# PATCH:
# /api/appointments/<id>/cancel/
# ==========================================================

class CancelAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"


    def get_queryset(self):

        try:

            patient = (
                self.request.user.patient_profile
            )

        except AttributeError:

            return Appointment.objects.none()


        return Appointment.objects.filter(

            patient=patient

        )


    def patch(self, request, *args, **kwargs):

        appointment = self.get_object()


        # ----------------------------------------------
        # Cannot cancel completed appointment
        # ----------------------------------------------

        if appointment.status == "Completed":

            return Response(

                {

                    "detail":
                    "Completed appointments cannot be cancelled."

                },

                status=status.HTTP_400_BAD_REQUEST

            )


        # ----------------------------------------------
        # Already cancelled
        # ----------------------------------------------

        if appointment.status == "Cancelled":

            return Response(

                {

                    "detail":
                    "This appointment is already cancelled."

                },

                status=status.HTTP_400_BAD_REQUEST

            )


        with transaction.atomic():

            slot = TimeSlot.objects.select_for_update().get(

                id=appointment.slot.id

            )


            # ==================================================
            # Cancel Appointment
            # ==================================================

            appointment.status = "Cancelled"

            appointment.save(

                update_fields=[
                    "status",
                    "updated_at",
                ]

            )


            # ==================================================
            # Create Cancellation Notification
            # ==================================================

            doctor_name = (
                appointment.doctor.user.get_full_name()
            )

            if not doctor_name:

                doctor_name = (
                    appointment.doctor.user.username
                )


            Notification.objects.create(

                user=request.user,

                notification_type="Appointment",

                title="Appointment Cancelled",

                message=(
                    f"Your appointment with Dr. {doctor_name} "
                    f"has been cancelled successfully."
                ),

            )


            # ==================================================
            # Reduce booked count
            # ==================================================

            if slot.booked_count > 0:

                slot.booked_count -= 1

                slot.save(

                    update_fields=[
                        "booked_count"
                    ]

                )


        return Response(

            {

                "message":
                "Appointment cancelled successfully."

            },

            status=status.HTTP_200_OK

        )
