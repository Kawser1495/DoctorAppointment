from django.urls import path


from .views import (

    PatientMedicalReportListView,

    MedicalReportDetailView,

    DoctorMedicalReportListView,

    DoctorMedicalReportCreateView,

    DoctorMedicalReportDetailView,

    AdminMedicalReportListView,

    AdminMedicalReportStatusView,

    AdminMedicalReportUpdateView,

    FeedbackMessageListView,

    FeedbackMessageCreateView,

    FeedbackMessageClearView,

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

        path(

            "admin/<int:pk>/",

            AdminMedicalReportUpdateView.as_view(),

            name="admin-report-update",

        ),


    path(

        "feedback/",

        FeedbackMessageListView.as_view(),

        name="feedback-list",

    ),


    path(

        "feedback/send/",

        FeedbackMessageCreateView.as_view(),

        name="feedback-send",

    ),

    path(

        "feedback/clear/",

        FeedbackMessageClearView.as_view(),

        name="feedback-clear",

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