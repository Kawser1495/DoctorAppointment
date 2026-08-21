from django.urls import path

from .views import (
    PatientMedicalReportListView,
    MedicalReportDetailView,
    DoctorMedicalReportListView,
)


app_name = "reports"


urlpatterns = [

    # Patient Reports
    path(
        "patient/",
        PatientMedicalReportListView.as_view(),
        name="patient-reports",
    ),

    # Report Details
    path(
        "<int:pk>/",
        MedicalReportDetailView.as_view(),
        name="report-detail",
    ),

    # Doctor Reports
    path(
        "doctor/",
        DoctorMedicalReportListView.as_view(),
        name="doctor-reports",
    ),
]