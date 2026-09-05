from django.urls import path


from .views import (

    PatientMedicalReportListView,

    MedicalReportDetailView,

    DoctorMedicalReportListView,

    DoctorMedicalReportCreateView,

    DoctorMedicalReportDetailView,

    AdminMedicalReportListView,

    AdminMedicalReportStatusView,

)


app_name = "reports"


urlpatterns = [


    # ======================================================
    # Patient Reports
    # ======================================================

    path(

        "patient/",

        PatientMedicalReportListView.as_view(),

        name="patient-reports",

    ),


    # ======================================================
    # Doctor Report List
    # ======================================================

    path(

        "doctor/",

        DoctorMedicalReportListView.as_view(),

        name="doctor-reports",

    ),


    path(

        "admin/",

        AdminMedicalReportListView.as_view(),

        name="admin-reports",

    ),


    path(

        "admin/<int:pk>/status/",

        AdminMedicalReportStatusView.as_view(),

        name="admin-report-status",

    ),


    # ======================================================
    # Doctor Create Report
    # ======================================================

    path(

        "doctor/create/",

        DoctorMedicalReportCreateView.as_view(),

        name="doctor-create-report",

    ),


    # ======================================================
    # Doctor Report Details
    #
    # GET
    # PATCH
    # DELETE
    # ======================================================

    path(

        "doctor/<int:pk>/",

        DoctorMedicalReportDetailView.as_view(),

        name="doctor-report-detail",

    ),


    # ======================================================
    # Patient Single Report
    #
    # Keep Generic ID Route Last
    # ======================================================

    path(

        "<int:pk>/",

        MedicalReportDetailView.as_view(),

        name="report-detail",

    ),

]