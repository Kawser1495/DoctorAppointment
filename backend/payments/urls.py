from django.urls import path

from .views import (
    PaymentCreateView,
    PaymentListView,
    PaymentDetailView,
    PaymentStatusUpdateView,
)

app_name = "payments"

urlpatterns = [

    # ==========================================
    # Create Payment
    # POST: /api/payments/create/
    # ==========================================
    path(
        "create/",
        PaymentCreateView.as_view(),
        name="payment-create",
    ),

    # ==========================================
    # My Payment History
    # GET: /api/payments/
    # ==========================================
    path(
        "",
        PaymentListView.as_view(),
        name="payment-list",
    ),

    # ==========================================
    # Single Payment Detail
    # GET: /api/payments/1/
    # ==========================================
    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),

    # ==========================================
    # Update Payment Status
    # PATCH: /api/payments/1/status/
    # ==========================================
    path(
        "<int:pk>/status/",
        PaymentStatusUpdateView.as_view(),
        name="payment-status-update",
    ),
]