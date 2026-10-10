from django.db import transaction
from django.db.models import Count
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError

from .models import PatientProfile, FamilyMember
from appointments.models import Appointment
from doctors.models import Doctor

from .serializers import (
    AdminPatientSerializer,
    PatientProfileSerializer,
    FamilyMemberSerializer,
)

from accounts.permissions import IsAdmin


# ==========================================================
# Patient Role Helper
# ==========================================================

# ==========================================================
# Patient Role Helper
# ==========================================================

def ensure_patient_user(user):

    if not user.is_authenticated:

        raise ValidationError(
            {
                "detail":
                "Authentication is required."
            }
        )

    user_role = getattr(
        user,
        "role",
        ""
    )

    if str(user_role).lower() != "patient":

        raise ValidationError(
            {
                "detail":
                f"Only patient users can access this resource. Current role: {user_role}"
            }
        )


# ==========================================================
# Patient Profile
#
# GET:   /api/patients/profile/
# PUT:   /api/patients/profile/
# PATCH: /api/patients/profile/
# ==========================================================

class PatientProfileView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = PatientProfileSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self):

        ensure_patient_user(
            self.request.user
        )

        try:

            return PatientProfile.objects.select_related(
                "user"
            ).get(
                user=self.request.user
            )

        except PatientProfile.DoesNotExist:

            raise NotFound(
                "Patient profile has not been created yet."
            )


# ==========================================================
# Create Patient Profile
#
# POST: /api/patients/profile/create/
# ==========================================================

class PatientProfileCreateView(
    generics.CreateAPIView
):

    serializer_class = PatientProfileSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(self, serializer):

        ensure_patient_user(
            self.request.user
        )

        if hasattr(
            self.request.user,
            "patient_profile"
        ):

            raise ValidationError(
                {
                    "detail":
                    "Patient profile already exists."
                }
            )

        serializer.save(
            user=self.request.user
        )


# ==========================================================
# Family Member List + Create
#
# GET:  /api/patients/family/
# POST: /api/patients/family/
# ==========================================================

class FamilyMemberListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = FamilyMemberSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        ensure_patient_user(
            self.request.user
        )

        try:

            patient = (
                self.request.user.patient_profile
            )

        except PatientProfile.DoesNotExist:

            raise ValidationError(
                {
                    "detail":
                    "Please create your patient profile first."
                }
            )

        return FamilyMember.objects.filter(
            patient=patient
        ).order_by(
            "name"
        )

    def perform_create(self, serializer):

        ensure_patient_user(
            self.request.user
        )

        try:

            patient = (
                self.request.user.patient_profile
            )

        except PatientProfile.DoesNotExist:

            raise ValidationError(
                {
                    "detail":
                    "Please create your patient profile first."
                }
            )

        serializer.save(
            patient=patient
        )


# ==========================================================
# Family Member Detail
#
# GET:    /api/patients/family/<id>/
# PUT:    /api/patients/family/<id>/
# PATCH:  /api/patients/family/<id>/
# DELETE: /api/patients/family/<id>/
# ==========================================================

class FamilyMemberDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = FamilyMemberSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        ensure_patient_user(
            self.request.user
        )

        try:

            patient = (
                self.request.user.patient_profile
            )

        except PatientProfile.DoesNotExist:

            raise ValidationError(
                {
                    "detail":
                    "Please create your patient profile first."
                }
            )

        return FamilyMember.objects.filter(
            patient=patient
        )


class AdminPatientListView(generics.ListAPIView):

    serializer_class = AdminPatientSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None

    def get_queryset(self):
        queryset = PatientProfile.objects.select_related("user").prefetch_related(
            "family_members"
        )
        search = self.request.query_params.get("search", "").strip()
        doctor_id = self.request.query_params.get("doctor", "").strip()

        if search:
            queryset = queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                user__username__icontains=search
            ) | queryset.filter(
                user__email__icontains=search
            ) | queryset.filter(
                user__phone__icontains=search
            ) | queryset.filter(
                appointments__doctor__user__first_name__icontains=search
            ) | queryset.filter(
                appointments__doctor__user__last_name__icontains=search
            )

        if doctor_id:
            queryset = queryset.filter(appointments__doctor_id=doctor_id)

        return queryset.distinct().order_by("user__first_name", "user__username")


class AdminDoctorPatientSummaryView(generics.ListAPIView):

    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        doctors = Doctor.objects.select_related("user", "department").filter(
            user__role="doctor",
        ).order_by("user__first_name", "user__username")

        data = []
        for doctor in doctors:
            people = {}
            appointments = Appointment.objects.filter(
                doctor=doctor,
                status__in=["Pending", "Confirmed", "Completed"],
            ).select_related(
                "patient__user",
                "family_member",
                "slot",
            ).order_by("appointment_date", "slot__slot_time", "booking_number")

            for appointment in appointments:
                family_member = appointment.family_member
                if family_member:
                    person_id = f"family_member:{family_member.id}"
                    person_name = family_member.name
                    person_type = "Family member"
                    relation = family_member.relation or "Family member"
                else:
                    person_id = f"patient:{appointment.patient_id}"
                    person_name = appointment.patient.user.get_full_name().strip() or appointment.patient.user.username
                    person_type = "Patient"
                    relation = "Account holder"

                person = people.setdefault(person_id, {
                    "id": person_id,
                    "name": person_name,
                    "person_type": person_type,
                    "relation": relation,
                    "patient_id": appointment.patient_id,
                    "family_member_id": family_member.id if family_member else None,
                    "appointment_count": 0,
                    "appointments": [],
                })
                person["appointment_count"] += 1
                person["appointments"].append({
                    "id": appointment.id,
                    "booking_number": appointment.booking_number,
                    "appointment_date": appointment.appointment_date,
                    "slot_time": appointment.slot.slot_time,
                    "time_range": appointment.slot.time_range,
                    "status": appointment.status,
                })

            people_data = sorted(people.values(), key=lambda person: person["name"].lower())
            data.append({
                "id": doctor.id,
                "name": doctor.user.get_full_name().strip() or doctor.user.username,
                "department": doctor.department.name if doctor.department else "Unassigned",
                "patient_count": sum(person["person_type"] == "Patient" for person in people_data),
                "person_count": len(people_data),
                "appointment_count": sum(person["appointment_count"] for person in people_data),
                "people": people_data,
            })
        return Response(data)


class AdminPatientDetailView(generics.RetrieveDestroyAPIView):

    serializer_class = AdminPatientSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return PatientProfile.objects.select_related("user").prefetch_related(
            "family_members"
        )

    def destroy(self, request, *args, **kwargs):
        patient = self.get_object()
        patient_name = patient.user.get_full_name().strip() or patient.user.username

        with transaction.atomic():
            appointments = Appointment.objects.filter(patient=patient)
            deleted_appointment_count = appointments.count()
            appointments.delete()
            patient.user.delete()

        return Response(
            {
                "detail": f"Patient {patient_name} and all related records were deleted.",
                "deleted_appointment_count": deleted_appointment_count,
            },
            status=status.HTTP_200_OK,
        )