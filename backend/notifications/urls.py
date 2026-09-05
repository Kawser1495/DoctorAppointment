from django.urls import path

from .views import (
    NotificationListView,
    NotificationDetailView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationDeleteView,
    AdminNotificationListView,
    AdminNotificationReadView,
    AdminNotificationDeleteView,
)


app_name = "notifications"


urlpatterns = [

    path(
        "admin/",
        AdminNotificationListView.as_view(),
        name="admin-notification-list",
    ),

    path(
        "admin/<int:pk>/read/",
        AdminNotificationReadView.as_view(),
        name="admin-notification-read",
    ),

    path(
        "admin/<int:pk>/delete/",
        AdminNotificationDeleteView.as_view(),
        name="admin-notification-delete",
    ),

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