from django.urls import path

from .views import (
    BookAppointmentView,
    PatientAppointmentListView,
    AppointmentDetailView,
    CancelAppointmentView,

    DoctorAppointmentListView,
    DoctorAppointmentDetailView,
    DoctorConfirmAppointmentView,
    DoctorRejectAppointmentView,
    DoctorCompleteAppointmentView,
    AdminAppointmentListView,
    AdminAppointmentStatusView,
    AdminAppointmentDeleteView,
    ReceptionistAppointmentListView,
    ReceptionistAppointmentStatusView,
    AppointmentAIReportView,
    SharedAISymptomReportView,
    SymptomAnalysisView,
)


app_name = "appointments"


urlpatterns = [

    # ======================================================
    # Book Appointment
    # POST: /api/appointments/book/
    # ======================================================

    path(
        "book/",
        BookAppointmentView.as_view(),
        name="book-appointment",
    ),

    path(
        "admin/",
        AdminAppointmentListView.as_view(),
        name="admin-appointments",
    ),

    path("receptionist/", ReceptionistAppointmentListView.as_view(), name="receptionist-appointments"),
    path("receptionist/<int:pk>/status/", ReceptionistAppointmentStatusView.as_view(), name="receptionist-appointment-status"),

    path(
        "admin/<int:pk>/status/",
        AdminAppointmentStatusView.as_view(),
        name="admin-appointment-status",
    ),

    path(
        "admin/<int:pk>/delete/",
        AdminAppointmentDeleteView.as_view(),
        name="admin-appointment-delete",
    ),


    # ======================================================
    # Patient Appointments
    # GET: /api/appointments/patient/
    # ======================================================

    path(
        "patient/",
        PatientAppointmentListView.as_view(),
        name="patient-appointments",
    ),


    # ======================================================
    # Doctor Appointments
    # GET: /api/appointments/doctor/
    # ======================================================

    path(
        "doctor/",
        DoctorAppointmentListView.as_view(),
        name="doctor-appointments",
    ),


    # ======================================================
    # Doctor Appointment Detail
    # GET: /api/appointments/doctor/<id>/
    # ======================================================

    path(
        "doctor/<int:id>/",
        DoctorAppointmentDetailView.as_view(),
        name="doctor-appointment-detail",
    ),

    path(
        "<int:id>/ai-report/",
        AppointmentAIReportView.as_view(),
        name="appointment-ai-report",
    ),

    path(
        "ai-reports/",
        SharedAISymptomReportView.as_view(),
        name="shared-ai-reports",
    ),

    path(
        "symptom-analysis/",
        SymptomAnalysisView.as_view(),
        name="symptom-analysis",
    ),

    path(
        "ai-reports/<int:id>/",
        SharedAISymptomReportView.as_view(),
        name="shared-ai-report-detail",
    ),


    # ======================================================
    # Doctor Confirm Appointment
    # PATCH: /api/appointments/doctor/<id>/confirm/
    # ======================================================

    path(
        "doctor/<int:id>/confirm/",
        DoctorConfirmAppointmentView.as_view(),
        name="doctor-appointment-confirm",
    ),


    # ======================================================
    # Doctor Reject Appointment
    # PATCH: /api/appointments/doctor/<id>/reject/
    # ======================================================

    path(
        "doctor/<int:id>/reject/",
        DoctorRejectAppointmentView.as_view(),
        name="doctor-appointment-reject",
    ),


    # ======================================================
    # Doctor Complete Appointment
    # PATCH: /api/appointments/doctor/<int:id>/complete/
    # ======================================================

    path(
        "doctor/<int:id>/complete/",
        DoctorCompleteAppointmentView.as_view(),
        name="doctor-appointment-complete",
    ),


    # ======================================================
    # Appointment Details - Patient
    # GET: /api/appointments/<id>/
    # ======================================================

    path(
        "<int:id>/",
        AppointmentDetailView.as_view(),
        name="appointment-details",
    ),


    # ======================================================
    # Cancel Appointment - Patient
    # PATCH: /api/appointments/<id>/cancel/
    # ======================================================

    path(
        "<int:id>/cancel/",
        CancelAppointmentView.as_view(),
        name="cancel-appointment",
    ),

]