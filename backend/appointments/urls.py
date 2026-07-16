from django.urls import path

from .views import (
    AppointmentCreateView,
    PatientAppointmentListView,
    AppointmentDetailView,
    AppointmentUpdateView,
    AppointmentCancelView,
    DoctorAppointmentView,
    AdminAppointmentView,
    AppointmentStatusUpdateView,
)

app_name = "appointments"

urlpatterns = [

    # ==========================================
    # Appointment Booking
    # POST: /api/appointments/book/
    # ==========================================
    path(
        "book/",
        AppointmentCreateView.as_view(),
        name="appointment-book",
    ),

    # ==========================================
    # Logged-in Patient Appointment List
    # GET: /api/appointments/patient/
    # ==========================================
    path(
        "patient/",
        PatientAppointmentListView.as_view(),
        name="patient-appointments",
    ),

    # ==========================================
    # Appointment Details
    # GET: /api/appointments/5/
    # ==========================================
    path(
        "<int:pk>/",
        AppointmentDetailView.as_view(),
        name="appointment-detail",
    ),

    # ==========================================
    # Update Appointment
    # PUT/PATCH: /api/appointments/5/update/
    # ==========================================
    path(
        "<int:pk>/update/",
        AppointmentUpdateView.as_view(),
        name="appointment-update",
    ),

    # ==========================================
    # Cancel Appointment
    # PATCH: /api/appointments/5/cancel/
    # ==========================================
    path(
        "<int:pk>/cancel/",
        AppointmentCancelView.as_view(),
        name="appointment-cancel",
    ),

    # ==========================================
    # Doctor Appointment List
    # GET: /api/appointments/doctor/
    # ==========================================
    path(
        "doctor/",
        DoctorAppointmentView.as_view(),
        name="doctor-appointments",
    ),

    # ==========================================
    # Admin Appointment List
    # GET: /api/appointments/admin/
    # ==========================================
    path(
        "admin/",
        AdminAppointmentView.as_view(),
        name="admin-appointments",
    ),

    # ==========================================
    # Update Appointment Status
    # PATCH: /api/appointments/5/status/
    # ==========================================
    path(
        "<int:pk>/status/",
        AppointmentStatusUpdateView.as_view(),
        name="appointment-status",
    ),
]