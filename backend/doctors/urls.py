from django.urls import path

from .views import (
    DoctorListView,
    DepartmentListView,
    DoctorSearchView,
    DoctorByDepartmentView,
    DepartmentAPIView,
    DoctorByDepartmentAPIView,
)

urlpatterns = [

    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list",
    ),

    path(
        "departments/",
        DepartmentListView.as_view(),
        name="department-list",
    ),

    path(
        "search/",
        DoctorSearchView.as_view(),
        name="doctor-search",
    ),

    path(
        "departments/<int:department_id>/",
        DoctorByDepartmentView.as_view(),
        name="doctor-by-department",
    ),

    path(
        "api/departments/",
        DepartmentAPIView.as_view(),
        name="api-departments",
    ),

    path(
        "api/departments/<int:department_id>/doctors/",
        DoctorByDepartmentAPIView.as_view(),
        name="api-doctors-by-department",
    ),

]