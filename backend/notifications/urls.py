from django.urls import path

from .views import (
    NotificationListView,
    NotificationDetailView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationDeleteView,
)


app_name = "notifications"


urlpatterns = [

    # ======================================================
    # My Notifications
    # GET: /api/notifications/
    # ======================================================

    path(
        "",
        NotificationListView.as_view(),
        name="notification-list",
    ),

    # ======================================================
    # Mark All as Read
    # PATCH: /api/notifications/read-all/
    # ======================================================

    path(
        "read-all/",
        NotificationMarkAllReadView.as_view(),
        name="notification-read-all",
    ),

    # ======================================================
    # Notification Details
    # GET: /api/notifications/<id>/
    # ======================================================

    path(
        "<int:pk>/",
        NotificationDetailView.as_view(),
        name="notification-detail",
    ),

    # ======================================================
    # Mark as Read
    # PATCH: /api/notifications/<id>/read/
    # ======================================================

    path(
        "<int:pk>/read/",
        NotificationMarkReadView.as_view(),
        name="notification-read",
    ),

    # ======================================================
    # Delete Notification
    # DELETE: /api/notifications/<id>/
    # ======================================================

    path(
        "<int:pk>/delete/",
        NotificationDeleteView.as_view(),
        name="notification-delete",
    ),

]