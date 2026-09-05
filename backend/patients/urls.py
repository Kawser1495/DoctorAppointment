from django.urls import path

from .views import (
    PatientProfileView,
    PatientProfileCreateView,
    FamilyMemberListCreateView,
    FamilyMemberDetailView,
    AdminPatientListView,
    AdminPatientDetailView,
)


app_name = "patients"


urlpatterns = [

    # ======================================================
    # Patient Profile
    # ======================================================

    path(
        "profile/",
        PatientProfileView.as_view(),
        name="profile",
    ),

    path(
        "profile/create/",
        PatientProfileCreateView.as_view(),
        name="profile-create",
    ),

    # ======================================================
    # Family Members
    # ======================================================

    path(
        "family/",
        FamilyMemberListCreateView.as_view(),
        name="family-list-create",
    ),

    path(
        "family/<int:pk>/",
        FamilyMemberDetailView.as_view(),
        name="family-detail",
    ),

    path(
        "admin/",
        AdminPatientListView.as_view(),
        name="admin-patient-list",
    ),

    path(
        "admin/<int:pk>/",
        AdminPatientDetailView.as_view(),
        name="admin-patient-detail",
    ),
]