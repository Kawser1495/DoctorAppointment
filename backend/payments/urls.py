from django.urls import path

from .views import (
    PaymentCreateView,
    PaymentListView,
    PaymentDetailView,
    PaymentStatusUpdateView,
    AdminPaymentListView,
    AdminPaymentDeleteView,
    AdminDiagnosticReportInfoView,
    PaymentRefundView,
    DoctorPaymentListView,
    DoctorPaymentRefundView,
    PatientRefundRequestView,
    RefundRequestListView,
    RefundRequestStatusView,
    SSLCommerzCreateView,
    SSLCommerzAIReportCreateView,
    SSLCommerzCallbackView,
)


app_name = "payments"


urlpatterns = [

    path("sslcommerz/create/", SSLCommerzCreateView.as_view(), name="sslcommerz-create"),
    path("sslcommerz/ai-report/create/", SSLCommerzAIReportCreateView.as_view(), name="sslcommerz-ai-report-create"),
    path("sslcommerz/<str:callback_status>/", SSLCommerzCallbackView.as_view(), name="sslcommerz-callback"),

    # ==========================================
    # Create Payment
    # POST /api/payments/create/
    # ==========================================

    path(
        "create/",
        PaymentCreateView.as_view(),
        name="payment-create",
    ),


    # ==========================================
    # My Payment History
    # GET /api/payments/
    # ==========================================

    path(
        "",
        PaymentListView.as_view(),
        name="payment-list",
    ),


    # ==========================================
    # Admin Payment Management
    # GET /api/payments/admin/
    # ==========================================

    path(
        "admin/",
        AdminPaymentListView.as_view(),
        name="admin-payment-list",
    ),

    path(
        "admin/<int:pk>/",
        AdminPaymentDeleteView.as_view(),
        name="admin-payment-delete",
    ),

    path(
        "admin/<int:pk>/diagnostic-report/",
        AdminDiagnosticReportInfoView.as_view(),
        name="admin-diagnostic-report-info",
    ),

    path("doctor/", DoctorPaymentListView.as_view(), name="doctor-payment-list"),
    path("doctor/<int:pk>/refund/", DoctorPaymentRefundView.as_view(), name="doctor-payment-refund"),
    path("refund-requests/", RefundRequestListView.as_view(), name="refund-request-list"),
    path("refund-requests/<int:pk>/status/", RefundRequestStatusView.as_view(), name="refund-request-status"),


    # ==========================================
    # Payment Details
    # GET /api/payments/<id>/
    # ==========================================

    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),


    # ==========================================
    # Update Payment Status
    # PATCH /api/payments/<id>/status/
    # ==========================================

    path(
        "<int:pk>/status/",
        PaymentStatusUpdateView.as_view(),
        name="payment-status-update",
    ),


    # ==========================================
    # Refund Payment
    # PATCH /api/payments/<id>/refund/
    # ==========================================

    path(
        "<int:pk>/refund/",
        PaymentRefundView.as_view(),
        name="payment-refund",
    ),
    path("<int:pk>/refund-request/", PatientRefundRequestView.as_view(), name="payment-refund-request"),

]