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

)


app_name = "appointments"


urlpatterns = [


    # ======================================================
    # Book Appointment
    #
    # POST:
    # /api/appointments/book/
    # ======================================================

    path(

        "book/",

        BookAppointmentView.as_view(),

        name="book-appointment",

    ),


    # ======================================================
    # My Appointments
    #
    # GET:
    # /api/appointments/patient/
    # ======================================================

    path(

        "patient/",

        PatientAppointmentListView.as_view(),

        name="patient-appointments",

    ),


    # ======================================================
    # Appointment Details
    #
    # GET:
    # /api/appointments/<id>/
    # ======================================================

    path(

        "<int:id>/",

        AppointmentDetailView.as_view(),

        name="appointment-details",

    ),


    # ======================================================
    # Cancel Appointment
    #
    # PATCH:
    # /api/appointments/<id>/cancel/
    # ======================================================

    path(

        "<int:id>/cancel/",

        CancelAppointmentView.as_view(),

        name="cancel-appointment",

    ),
    
    
    # ==========================================================
    # Doctor Appointments
    # ==========================================================

    path(
        "doctor/",
        DoctorAppointmentListView.as_view(),
        name="doctor-appointments",
    ),

    path(
        "doctor/<int:id>/",
        DoctorAppointmentDetailView.as_view(),
        name="doctor-appointment-detail",
    ),

    path(
        "doctor/<int:id>/confirm/",
        DoctorConfirmAppointmentView.as_view(),
        name="doctor-appointment-confirm",
    ),

    path(
        "doctor/<int:id>/reject/",
        DoctorRejectAppointmentView.as_view(),
        name="doctor-appointment-reject",
    ),

    path(
        "doctor/<int:id>/complete/",
        DoctorCompleteAppointmentView.as_view(),
        name="doctor-appointment-complete",
    ),

]