from django.urls import path

from .views import (
    PatientMedicalReportListView,
    MedicalReportDetailView,
    DoctorMedicalReportListView,
)


app_name = "reports"


urlpatterns = [

    # ======================================================
    # Patient
    # ======================================================

    path(
        "patient/",
        PatientMedicalReportListView.as_view(),
        name="patient-reports",
    ),

    # ======================================================
    # Single Report
    # ======================================================

    path(
        "<int:pk>/",
        MedicalReportDetailView.as_view(),
        name="report-detail",
    ),

    # ======================================================
    # Doctor
    # ======================================================

    path(
        "doctor/",
        DoctorMedicalReportListView.as_view(),
        name="doctor-reports",
    ),
]