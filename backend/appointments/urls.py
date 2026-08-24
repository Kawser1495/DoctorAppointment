from django.urls import path

from .views import (

    BookAppointmentView,

    PatientAppointmentListView,

    AppointmentDetailView,

    CancelAppointmentView,

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

]