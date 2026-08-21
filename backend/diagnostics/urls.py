from django.urls import path

from .views import (
    TestCategoryListView,
    DiagnosticTestListView,
    DiagnosticTestDetailView,
    TestBookingCreateView,
    MyTestBookingListView,
    TestBookingDetailView,
    TestBookingCancelView,
)


app_name = "diagnostics"


urlpatterns = [

    # ======================================================
    # Test Categories
    # ======================================================

    path(
        "categories/",
        TestCategoryListView.as_view(),
        name="category-list",
    ),

    # ======================================================
    # Diagnostic Tests
    # ======================================================

    path(
        "tests/",
        DiagnosticTestListView.as_view(),
        name="test-list",
    ),

    path(
        "tests/<int:pk>/",
        DiagnosticTestDetailView.as_view(),
        name="test-detail",
    ),

    # ======================================================
    # Booking
    # ======================================================

    path(
        "book/",
        TestBookingCreateView.as_view(),
        name="test-booking",
    ),

    # ======================================================
    # My Bookings
    # ======================================================

    path(
        "bookings/",
        MyTestBookingListView.as_view(),
        name="my-bookings",
    ),

    path(
        "bookings/<int:pk>/",
        TestBookingDetailView.as_view(),
        name="booking-detail",
    ),

    # ======================================================
    # Cancel Booking
    # ======================================================

    path(
        "bookings/<int:pk>/cancel/",
        TestBookingCancelView.as_view(),
        name="booking-cancel",
    ),

]