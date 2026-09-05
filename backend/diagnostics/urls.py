from django.urls import path

from .views import (
    TestCategoryListView,
    DiagnosticTestListView,
    DiagnosticTestDetailView,
    TestBookingCreateView,
    MyTestBookingListView,
    TestBookingDetailView,
    TestBookingCancelView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminDiagnosticTestListCreateView,
    AdminDiagnosticTestDetailView,
    AdminTestBookingListView,
    AdminTestBookingStatusView,
)


app_name = "diagnostics"


urlpatterns = [

    # Categories

    path(
        "categories/",
        TestCategoryListView.as_view(),
        name="category-list",
    ),
        path("admin/categories/", AdminCategoryListCreateView.as_view(), name="admin-category-list"),
        path("admin/categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),


    # Diagnostic Tests

    path(
        "tests/",
        DiagnosticTestListView.as_view(),
        name="test-list",
    ),
        path("admin/tests/", AdminDiagnosticTestListCreateView.as_view(), name="admin-test-list"),
        path("admin/tests/<int:pk>/", AdminDiagnosticTestDetailView.as_view(), name="admin-test-detail"),

    path(
        "tests/<int:pk>/",
        DiagnosticTestDetailView.as_view(),
        name="test-detail",
    ),


    # Book Test

    path(
        "book/",
        TestBookingCreateView.as_view(),
        name="test-booking",
    ),


    # My Bookings

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


    # Cancel Booking

    path(
        "bookings/<int:pk>/cancel/",
        TestBookingCancelView.as_view(),
        name="booking-cancel",
    ),
        path("admin/bookings/", AdminTestBookingListView.as_view(), name="admin-booking-list"),
        path("admin/bookings/<int:pk>/status/", AdminTestBookingStatusView.as_view(), name="admin-booking-status"),

]