from django.urls import path

from .views import *

urlpatterns = [

    path(

        "book/",

        AppointmentCreateView.as_view()

    ),

    path(

        "list/",

        PatientAppointmentListView.as_view()

    ),

    path(

        "details/<int:pk>/",

        AppointmentDetailView.as_view()

    ),

    path(

        "update/<int:pk>/",

        AppointmentUpdateView.as_view()

    ),

    path(

        "cancel/<int:pk>/",

        AppointmentCancelView.as_view()

    ),

    path(

        "doctor/",

        DoctorAppointmentView.as_view()

    ),

    path(

        "admin/",

        AdminAppointmentView.as_view()

    ),

]