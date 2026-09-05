from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError

from .models import PatientProfile, FamilyMember

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
        return PatientProfile.objects.select_related("user").prefetch_related(
            "family_members"
        ).order_by("user__first_name", "user__username")


class AdminPatientDetailView(generics.RetrieveAPIView):

    serializer_class = AdminPatientSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return PatientProfile.objects.select_related("user").prefetch_related(
            "family_members"
        )