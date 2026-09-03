"""
URL configuration for Doctor Appointment System.
"""

from django.contrib import admin

from django.conf import settings
from django.conf.urls.static import static

from django.urls import include, path


# ==========================================================
# URL PATTERNS
# ==========================================================

urlpatterns = [

    # ======================================================
    # Django Admin Panel
    # ======================================================

    path(
        "admin/",
        admin.site.urls,
    ),

    # ======================================================
    # Authentication APIs
    # ======================================================

    path(
        "api/accounts/",
        include("accounts.urls"),
    ),

    # ======================================================
    # Patient APIs
    # ======================================================

    path(
        "api/patients/",
        include("patients.urls"),
    ),

    # ======================================================
    # Doctor APIs
    # ======================================================

    path(
        "api/doctors/",
        include("doctors.urls"),
    ),

    # ======================================================
    # Appointment APIs
    # ======================================================

    path(
        "api/appointments/",
        include("appointments.urls"),
    ),

    # ======================================================
    # Diagnostic APIs
    # ======================================================

    path(
        "api/tests/",
        include("diagnostics.urls"),
    ),

    # ======================================================
    # Payment APIs
    # ======================================================

    path(
        "api/payments/",
        include("payments.urls"),
    ),

    # ======================================================
    # Medical Reports APIs
    # ======================================================

    path(
        "api/reports/",
        include("reports.urls"),
    ),

    # ======================================================
    # Dashboard APIs
    # ======================================================

    path(
        "api/dashboard/",
        include("dashboard.urls"),
    ),

    # ======================================================
    # Notifications APIs
    # ======================================================

    path(
        "api/notifications/",
        include("notifications.urls"),
    ),

]


# ==========================================================
# DEVELOPMENT MEDIA SERVING
# ==========================================================

if settings.DEBUG:

    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )