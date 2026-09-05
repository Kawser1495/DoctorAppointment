from django.urls import path

from .views import (
    # ======================================================
    # Public / Patient Side
    # ======================================================

    DepartmentListView,
    AdminDepartmentListCreateView,
    AdminDepartmentDetailView,
    DoctorListView,
    DoctorDetailView,
    DoctorSearchView,
    DoctorByDepartmentView,
    DoctorScheduleListView,
    AvailableTimeSlotAPIView,

    # ======================================================
    # Doctor Private Side
    # ======================================================

    DoctorMyProfileView,
    DoctorDashboardView,
    DoctorScheduleManageView,
)



from .views import (
    AdminPendingDoctorListView,
    AdminDoctorListView,
    AdminDoctorAvailabilityView,
    AdminApproveDoctorView,
    AdminRejectDoctorView,
    AdminScheduleListView,
    AdminScheduleDetailView,
    AdminTimeSlotAvailabilityView,
)


app_name = "doctors"


urlpatterns = [

    # ======================================================
    # PUBLIC / PATIENT SIDE
    # ======================================================

    # ------------------------------------------------------
    # Departments
    #
    # GET:
    # /api/doctors/departments/
    # ------------------------------------------------------

    path(
        "departments/",
        DepartmentListView.as_view(),
        name="department-list",
    ),

    path(
        "admin/departments/",
        AdminDepartmentListCreateView.as_view(),
        name="admin-department-list-create",
    ),

    path(
        "admin/departments/<int:pk>/",
        AdminDepartmentDetailView.as_view(),
        name="admin-department-detail",
    ),


    # ------------------------------------------------------
    # All Doctors
    #
    # GET:
    # /api/doctors/doctors/
    # ------------------------------------------------------

    path(
        "doctors/",
        DoctorListView.as_view(),
        name="doctor-list",
    ),


    # ------------------------------------------------------
    # Doctor Details
    #
    # GET:
    # /api/doctors/doctors/<id>/
    # ------------------------------------------------------

    path(
        "doctors/<int:pk>/",
        DoctorDetailView.as_view(),
        name="doctor-detail",
    ),


    # ------------------------------------------------------
    # Doctor Schedules
    #
    # GET:
    # /api/doctors/doctors/<doctor_id>/schedules/
    # ------------------------------------------------------

    path(
        "doctors/<int:doctor_id>/schedules/",
        DoctorScheduleListView.as_view(),
        name="doctor-schedules",
    ),


    # ------------------------------------------------------
    # Doctor Search
    #
    # GET:
    # /api/doctors/search/?search=cardiology
    # ------------------------------------------------------

    path(
        "search/",
        DoctorSearchView.as_view(),
        name="doctor-search",
    ),


    # ------------------------------------------------------
    # Doctors By Department
    #
    # GET:
    # /api/doctors/departments/<department_id>/doctors/
    # ------------------------------------------------------

    path(
        "departments/<int:department_id>/doctors/",
        DoctorByDepartmentView.as_view(),
        name="doctor-by-department",
    ),


    # ------------------------------------------------------
    # Available Time Slots
    #
    # GET:
    # /api/doctors/time-slots/?doctor=1&date=2026-08-31
    # ------------------------------------------------------

    path(
        "time-slots/",
        AvailableTimeSlotAPIView.as_view(),
        name="available-time-slots",
    ),


    # ======================================================
    # DOCTOR PRIVATE SIDE
    # ======================================================

    # ------------------------------------------------------
    # Doctor Dashboard
    #
    # GET:
    # /api/doctors/dashboard/
    # ------------------------------------------------------

    path(
        "dashboard/",
        DoctorDashboardView.as_view(),
        name="doctor-dashboard",
    ),


    # ------------------------------------------------------
    # My Doctor Profile
    #
    # GET:
    # /api/doctors/me/profile/
    # PATCH:
    # /api/doctors/me/profile/
    # PUT:
    # /api/doctors/me/profile/
    # ------------------------------------------------------

    path(
        "me/profile/",
        DoctorMyProfileView.as_view(),
        name="doctor-my-profile",
    ),

    # ------------------------------------------------------
    # Doctor Schedule Management
    #
    # GET /api/doctors/schedules/
    # POST /api/doctors/schedules/
    # PATCH /api/doctors/schedules/<id>/
    # DELETE /api/doctors/schedules/<id>/
    # ------------------------------------------------------

    path(
        "schedules/",
        DoctorScheduleManageView.as_view(),
        name="doctor-schedule-manage-list",
    ),

    path(
        "schedules/<int:pk>/",
        DoctorScheduleManageView.as_view(),
        name="doctor-schedule-manage-detail",
    ),

    path(
        "admin/schedules/",
        AdminScheduleListView.as_view(),
        name="admin-schedule-list",
    ),

    path(
        "admin/schedules/<int:pk>/",
        AdminScheduleDetailView.as_view(),
        name="admin-schedule-detail",
    ),

    path(
        "admin/time-slots/<int:pk>/availability/",
        AdminTimeSlotAvailabilityView.as_view(),
        name="admin-slot-availability",
    ),
    
    
    path(
        "admin/pending/",
        AdminPendingDoctorListView.as_view(),
        name="admin-pending-doctors",
    ),

    path(
        "admin/all/",
        AdminDoctorListView.as_view(),
        name="admin-doctor-list",
    ),

    path(
        "admin/<int:doctor_id>/availability/",
        AdminDoctorAvailabilityView.as_view(),
        name="admin-doctor-availability",
    ),

    path(
        "admin/<int:doctor_id>/approve/",
        AdminApproveDoctorView.as_view(),
        name="admin-approve-doctor",
    ),

    path(
        "admin/<int:doctor_id>/reject/",
        AdminRejectDoctorView.as_view(),
        name="admin-reject-doctor",
    ),


]