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

    path(
        "admin/<int:pk>/status/",
        AdminAppointmentStatusView.as_view(),
        name="admin-appointment-status",
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