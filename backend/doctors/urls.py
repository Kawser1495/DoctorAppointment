from django.urls import path

from .views import (
    DoctorListView,
    DepartmentListView,
    DoctorSearchView,
    DoctorByDepartmentView,
    DepartmentAPIView,
    DoctorByDepartmentAPIView,
    AvailableTimeSlotAPIView,
)

urlpatterns = [

    # ==========================================
    # Doctor List
    # ==========================================

    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list",
    ),

    # ==========================================
    # Department List
    # ==========================================

    path(
        "departments/",
        DepartmentListView.as_view(),
        name="department-list",
    ),

    # ==========================================
    # Doctor Search
    # ==========================================

    path(
        "search/",
        DoctorSearchView.as_view(),
        name="doctor-search",
    ),

    # ==========================================
    # Doctors By Department
    # ==========================================

    path(
        "departments/<int:department_id>/",
        DoctorByDepartmentView.as_view(),
        name="doctor-by-department",
    ),

    # ==========================================
    # Department API
    # ==========================================

    path(
        "api/departments/",
        DepartmentAPIView.as_view(),
        name="api-departments",
    ),

    # ==========================================
    # Doctor By Department API
    # ==========================================

    path(
        "api/departments/<int:department_id>/doctors/",
        DoctorByDepartmentAPIView.as_view(),
        name="api-doctors-by-department",
    ),

    # ==========================================
    # Available Time Slot API
    # ==========================================

    path(
        "time-slots/",
        AvailableTimeSlotAPIView.as_view(),
        name="available-time-slots",
    ),

]