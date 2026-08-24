from django.urls import path

from .views import (
    DepartmentListView,
    DoctorListView,
    DoctorSearchView,
    DoctorByDepartmentView,
    AvailableTimeSlotAPIView,
)


app_name = "doctors"


urlpatterns = [

    # ======================================================
    # Departments
    # ======================================================

    path(

        "departments/",

        DepartmentListView.as_view(),

        name="department-list",

    ),


    # ======================================================
    # All Doctors
    # ======================================================

    path(

        "doctors/",

        DoctorListView.as_view(),

        name="doctor-list",

    ),


    # ======================================================
    # Doctor Search
    # ======================================================

    path(

        "search/",

        DoctorSearchView.as_view(),

        name="doctor-search",

    ),


    # ======================================================
    # Doctors By Department
    # ======================================================

    path(

        "departments/<int:department_id>/doctors/",

        DoctorByDepartmentView.as_view(),

        name="doctor-by-department",

    ),


    # ======================================================
    # Available Time Slots
    # ======================================================

    path(

        "time-slots/",

        AvailableTimeSlotAPIView.as_view(),

        name="available-time-slots",

    ),

]