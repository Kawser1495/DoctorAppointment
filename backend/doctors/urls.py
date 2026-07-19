from django.urls import path

from .views import (
    DoctorListView,
    DepartmentListView,
    DoctorSearchView,
    DoctorByDepartmentView,
    AvailableTimeSlotAPIView,
)

app_name = "doctors"

urlpatterns = [

    # ==========================================
    # Doctor List
    # GET: /api/doctors/doctors/
    # ==========================================
    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list",
    ),

    # ==========================================
    # Department List
    # GET: /api/doctors/departments/
    # ==========================================
    path(
        "departments/",
        DepartmentListView.as_view(),
        name="department-list",
    ),

    # ==========================================
    # Doctor Search
    # GET: /api/doctors/search/
    # ==========================================
    path(
        "search/",
        DoctorSearchView.as_view(),
        name="doctor-search",
    ),

    # ==========================================
    # Doctors By Department
    # GET: /api/doctors/departments/<department_id>/doctors/
    # ==========================================
    path(
        "departments/<int:department_id>/doctors/",
        DoctorByDepartmentView.as_view(),
        name="doctor-by-department",
    ),

    # ==========================================
    # Available Time Slots
    # GET: /api/doctors/time-slots/?doctor=<doctor_id>
    # ==========================================
    path(
        "time-slots/",
        AvailableTimeSlotAPIView.as_view(),
        name="available-time-slots",
    ),

]