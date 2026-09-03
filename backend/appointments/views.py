from django.db import transaction

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.models import Notification
from doctors.models import TimeSlot
from patients.models import PatientProfile

from .models import Appointment
from .serializers import AppointmentSerializer


# ==========================================================
# Helper Functions
# ==========================================================

def get_patient_profile(user):
    """
    Return PatientProfile for logged-in user.

    Raises ValidationError if:
    - user is not authenticated
    - user is not a patient
    - patient profile does not exist
    """

    if not user or not user.is_authenticated:
        raise ValidationError({
            "detail": "Authentication is required."
        })

    if getattr(user, "role", None) != "patient":
        raise ValidationError({
            "detail": "Only patients can perform this action."
        })

    try:
        return user.patient_profile

    except PatientProfile.DoesNotExist:
        raise ValidationError({
            "patient": (
                "Patient profile not found. "
                "Please complete your patient profile first."
            )
        })


def get_doctor_name(doctor):
    """
    Return doctor display name.
    """

    full_name = (
        doctor.user.get_full_name().strip()
    )

    if full_name:
        return f"Dr. {full_name}"

    return f"Dr. {doctor.user.username}"


def create_appointment_notification(
    *,
    user,
    title,
    message,
):
    """
    Centralized appointment notification creator.
    """

    Notification.objects.create(
        user=user,
        notification_type="Appointment",
        title=title,
        message=message,
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

        # ==================================================
        # Get logged-in patient
        # ==================================================

        patient = get_patient_profile(
            self.request.user
        )

        # ==================================================
        # Patient Profile Completion Check
        # ==================================================

        incomplete_fields = []

        if not patient.phone_number:
            incomplete_fields.append("phone_number")

        if not patient.gender:
            incomplete_fields.append("gender")

        if not patient.date_of_birth:
            incomplete_fields.append("date_of_birth")

        if not patient.blood_group:
            incomplete_fields.append("blood_group")

        if not patient.address:
            incomplete_fields.append("address")

        if not patient.emergency_contact:
            incomplete_fields.append(
                "emergency_contact"
            )

        if incomplete_fields:

            raise ValidationError({
                "profile": (
                    "Please complete your patient profile "
                    "before booking an appointment."
                ),

                "missing_fields": incomplete_fields,
            })

        # ==================================================
        # Atomic Transaction
        # ==================================================

        with transaction.atomic():

            # ------------------------------------------------
            # Lock TimeSlot
            # ------------------------------------------------

            slot_id = serializer.validated_data[
                "slot"
            ].id

            slot = (
                TimeSlot.objects
                .select_for_update()
                .select_related(
                    "schedule",
                    "schedule__doctor",
                )
                .get(
                    id=slot_id
                )
            )

            # ------------------------------------------------
            # Slot Active Check
            # ------------------------------------------------

            if not slot.is_active:

                raise ValidationError({
                    "slot":
                    "This time slot is currently unavailable."
                })

            # ------------------------------------------------
            # Schedule Active Check
            # ------------------------------------------------

            if not slot.schedule.is_active:

                raise ValidationError({
                    "slot":
                    "Doctor schedule is currently inactive."
                })

            # ------------------------------------------------
            # Capacity Check
            #
            # IMPORTANT:
            # This project currently uses max_patient.
            # Keep this consistent with doctors.models.TimeSlot.
            # ------------------------------------------------

            if (
                slot.max_patient
                and
                slot.booked_count >= slot.max_patient
            ):

                raise ValidationError({
                    "slot":
                    "This time slot has just become full."
                })

            # ------------------------------------------------
            # Create Appointment
            # ------------------------------------------------

            appointment = serializer.save(
                patient=patient,
                status="Pending",
            )

            # ------------------------------------------------
            # Increase Booked Count
            # ------------------------------------------------

            slot.booked_count += 1

            slot.save(
                update_fields=[
                    "booked_count"
                ]
            )

            # ------------------------------------------------
            # Doctor Name
            # ------------------------------------------------

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            # ------------------------------------------------
            # Target Name
            # ------------------------------------------------

            if appointment.family_member:

                target_name = (
                    appointment.family_member.name
                )

            else:

                target_name = (
                    patient.user.get_full_name().strip()
                    or
                    patient.user.username
                )

            # ------------------------------------------------
            # Notification
            # ------------------------------------------------

            create_appointment_notification(

                user=self.request.user,

                title="Appointment Booked Successfully",

                message=(
                    f"Appointment {appointment.booking_number} "
                    f"for {target_name} with {doctor_name} "
                    f"has been booked successfully. "
                    f"Your appointment is currently pending."
                ),
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

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient
            )
            .select_related(
                "patient",
                "patient__user",

                "family_member",

                "doctor",
                "doctor__user",
                "doctor__department",

                "slot",
                "slot__schedule",
            )
            .order_by(
                "-appointment_date",
                "-created_at",
            )
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

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient
            )
            .select_related(
                "patient",
                "patient__user",

                "family_member",

                "doctor",
                "doctor__user",
                "doctor__department",

                "slot",
                "slot__schedule",
            )
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

            patient = get_patient_profile(
                self.request.user
            )

        except ValidationError:

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                patient=patient
            )
            .select_related(
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        # ==================================================
        # Only Pending / Confirmed Can Be Cancelled
        # ==================================================

        if appointment.status not in [
            "Pending",
            "Confirmed",
        ]:

            return Response(
                {
                    "detail": (
                        "Only pending or confirmed "
                        "appointments can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==================================================
        # Atomic Transaction
        # ==================================================

        with transaction.atomic():

            # ------------------------------------------------
            # Lock Slot
            # ------------------------------------------------

            slot = (
                TimeSlot.objects
                .select_for_update()
                .get(
                    id=appointment.slot_id
                )
            )

            # ------------------------------------------------
            # Cancel Appointment
            # ------------------------------------------------

            appointment.status = "Cancelled"

            appointment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            # ------------------------------------------------
            # Reduce Booked Count
            # ------------------------------------------------

            if slot.booked_count > 0:

                slot.booked_count -= 1

                slot.save(
                    update_fields=[
                        "booked_count"
                    ]
                )

            # ------------------------------------------------
            # Doctor Name
            # ------------------------------------------------

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            # ------------------------------------------------
            # Notification
            # ------------------------------------------------

            create_appointment_notification(

                user=request.user,

                title="Appointment Cancelled",

                message=(
                    f"Your appointment "
                    f"{appointment.booking_number} "
                    f"with {doctor_name} "
                    f"has been cancelled successfully."
                ),
            )

        return Response(
            {
                "message":
                    "Appointment cancelled successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Appointment List
#
# GET:
# /api/appointments/doctor/
# ==========================================================

class DoctorAppointmentListView(
    generics.ListAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":

            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return Appointment.objects.none()

        doctor = user.doctor_profile

        return (
            Appointment.objects
            .filter(
                doctor=doctor
            )
            .select_related(
                "patient",
                "patient__user",

                "family_member",

                "doctor",
                "doctor__user",
                "doctor__department",

                "slot",
                "slot__schedule",
            )
            .order_by(
                "appointment_date",
                "slot__slot_time",
            )
        )


# ==========================================================
# Doctor Appointment Detail
#
# GET:
# /api/appointments/doctor/<id>/
# ==========================================================

class DoctorAppointmentDetailView(
    generics.RetrieveAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":

            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return Appointment.objects.none()

        doctor = user.doctor_profile

        return (
            Appointment.objects
            .filter(
                doctor=doctor
            )
            .select_related(
                "patient",
                "patient__user",

                "family_member",

                "doctor",
                "doctor__user",
                "doctor__department",

                "slot",
                "slot__schedule",
            )
        )


# ==========================================================
# Doctor Confirm Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/confirm/
# ==========================================================

class DoctorConfirmAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":

            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        # ==================================================
        # Status Check
        # ==================================================

        if appointment.status != "Pending":

            return Response(
                {
                    "detail": (
                        "Only pending appointments "
                        "can be confirmed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==================================================
        # Confirm
        # ==================================================

        appointment.status = "Confirmed"

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # ==================================================
        # Notification
        # ==================================================

        doctor_name = get_doctor_name(
            appointment.doctor
        )

        create_appointment_notification(

            user=appointment.patient.user,

            title="Appointment Confirmed",

            message=(
                f"Your appointment "
                f"{appointment.booking_number} "
                f"with {doctor_name} "
                f"has been confirmed."
            ),
        )

        return Response(
            {
                "message":
                    "Appointment confirmed successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Reject Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/reject/
# ==========================================================

class DoctorRejectAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":

            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        # ==================================================
        # Only Pending Can Be Rejected
        # ==================================================

        if appointment.status != "Pending":

            return Response(
                {
                    "detail": (
                        "Only pending appointments "
                        "can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            slot = None

            # ------------------------------------------------
            # Lock Slot Safely
            # ------------------------------------------------

            if appointment.slot_id is not None:

                try:

                    slot = (
                        TimeSlot.objects
                        .select_for_update()
                        .get(
                            id=appointment.slot_id
                        )
                    )

                except TimeSlot.DoesNotExist:

                    slot = None

            # ------------------------------------------------
            # Reject Appointment
            # ------------------------------------------------

            appointment.status = "Rejected"

            appointment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            # ------------------------------------------------
            # Release Slot
            # ------------------------------------------------

            if slot is not None and slot.booked_count > 0:

                slot.booked_count = max(
                    slot.booked_count - 1,
                    0,
                )

                slot.save(
                    update_fields=[
                        "booked_count",
                        "updated_at",
                    ]
                )

            # ------------------------------------------------
            # Doctor Name
            # ------------------------------------------------

            doctor_name = get_doctor_name(
                appointment.doctor
            )

            # ------------------------------------------------
            # Notification
            # ------------------------------------------------

            create_appointment_notification(

                user=appointment.patient.user,

                title="Appointment Rejected",

                message=(
                    f"Your appointment "
                    f"{appointment.booking_number} "
                    f"with {doctor_name} "
                    f"has been rejected."
                ),
            )

        return Response(
            {
                "message":
                    "Appointment rejected successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Doctor Complete Appointment
#
# PATCH:
# /api/appointments/doctor/<id>/complete/
# ==========================================================

class DoctorCompleteAppointmentView(
    generics.UpdateAPIView
):

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated
    ]

    lookup_field = "id"

    def get_queryset(self):

        user = self.request.user

        if getattr(user, "role", None) != "doctor":

            return Appointment.objects.none()

        if not hasattr(
            user,
            "doctor_profile"
        ):

            return Appointment.objects.none()

        return (
            Appointment.objects
            .filter(
                doctor=user.doctor_profile
            )
            .select_related(
                "patient",
                "patient__user",
                "doctor",
                "doctor__user",
                "family_member",
                "slot",
            )
        )

    def patch(
        self,
        request,
        *args,
        **kwargs
    ):

        appointment = self.get_object()

        # ==================================================
        # Only Confirmed Can Be Completed
        # ==================================================

        if appointment.status != "Confirmed":

            return Response(
                {
                    "detail": (
                        "Only confirmed appointments "
                        "can be completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==================================================
        # Complete Appointment
        # ==================================================

        appointment.status = "Completed"

        appointment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # ==================================================
        # Notification
        # ==================================================

        doctor_name = get_doctor_name(
            appointment.doctor
        )

        create_appointment_notification(

            user=appointment.patient.user,

            title="Appointment Completed",

            message=(
                f"Your appointment "
                f"{appointment.booking_number} "
                f"with {doctor_name} "
                f"has been completed."
            ),
        )

        return Response(
            {
                "message":
                    "Appointment completed successfully.",

                "appointment":
                    AppointmentSerializer(
                        appointment,
                        context={
                            "request": request
                        }
                    ).data,
            },
            status=status.HTTP_200_OK,
        )