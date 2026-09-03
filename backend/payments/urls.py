from django.urls import path

from .views import (
    PaymentCreateView,
    PaymentListView,
    PaymentDetailView,
    PaymentStatusUpdateView,
    AdminPaymentListView,
    PaymentRefundView,
)


app_name = "payments"


urlpatterns = [

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

]