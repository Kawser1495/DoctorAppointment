from django.urls import path

from .views import (
    DepartmentListView,
    DoctorListView,
    DoctorDetailView,
    DoctorSearchView,
    DoctorByDepartmentView,
    DoctorScheduleListView,
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
    # Doctors
    # ======================================================

    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list",
    ),

    path(
        "doctors/<int:pk>/",
        DoctorDetailView.as_view(),
        name="doctor-detail",
    ),


    # ======================================================
    # Doctor Schedules
    # ======================================================

    path(
        "doctors/<int:doctor_id>/schedules/",
        DoctorScheduleListView.as_view(),
        name="doctor-schedules",
    ),


    # ======================================================
    # Search
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
    # Time Slots
    # ======================================================

    path(
        "time-slots/",
        AvailableTimeSlotAPIView.as_view(),
        name="available-time-slots",
    ),

]