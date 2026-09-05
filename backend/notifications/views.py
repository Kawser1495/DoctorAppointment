from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Notification
from .serializers import NotificationSerializer
from .serializers import AdminNotificationSerializer
from accounts.permissions import IsAdmin


# ==========================================================
# My Notifications
# ==========================================================
# GET: /api/notifications/
# ==========================================================

class NotificationListView(
    generics.ListAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Notification.objects
            .filter(
                user=self.request.user
            )
            .order_by(
                "-created_at"
            )
        )


# ==========================================================
# Notification Detail
# ==========================================================
# GET: /api/notifications/<id>/
# ==========================================================

class NotificationDetailView(
    generics.RetrieveAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        )


# ==========================================================
# Mark Notification as Read
# ==========================================================
# PATCH: /api/notifications/<id>/read/
# ==========================================================

class NotificationMarkReadView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        pk
    ):

        notification = get_object_or_404(

            Notification,

            pk=pk,

            user=request.user,
        )

        # --------------------------------------------------
        # Already Read
        # --------------------------------------------------

        if notification.is_read:

            return Response(
                {
                    "success": True,
                    "message":
                        "Notification is already marked as read.",
                    "data":
                        NotificationSerializer(
                            notification
                        ).data,
                },
                status=status.HTTP_200_OK,
            )

        # --------------------------------------------------
        # Mark as Read
        # --------------------------------------------------

        notification.is_read = True

        notification.save(
            update_fields=[
                "is_read",
                "updated_at",
            ]
        )

        return Response(
            {
                "success": True,
                "message":
                    "Notification marked as read.",
                "data":
                    NotificationSerializer(
                        notification
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Mark All Notifications as Read
# ==========================================================
# PATCH: /api/notifications/read-all/
# ==========================================================

class NotificationMarkAllReadView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request
    ):

        updated_count = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False,
            )
            .update(
                is_read=True
            )
        )

        return Response(
            {
                "success": True,
                "message":
                    "All notifications marked as read.",
                "updated_count":
                    updated_count,
            },
            status=status.HTTP_200_OK,
        )


# ==========================================================
# Delete Notification
# ==========================================================
# DELETE: /api/notifications/<id>/
# ==========================================================

class NotificationDeleteView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def delete(
        self,
        request,
        pk
    ):

        notification = get_object_or_404(

            Notification,

            pk=pk,

            user=request.user,
        )

        notification.delete()

        return Response(
            {
                "success": True,
                "message":
                    "Notification deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )


class AdminNotificationListView(generics.ListAPIView):

    serializer_class = AdminNotificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["notification_type", "is_read"]

    def get_queryset(self):
        return Notification.objects.select_related("user").order_by(
            "-created_at"
        )


class AdminNotificationReadView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        return Response(AdminNotificationSerializer(notification).data)


class AdminNotificationDeleteView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)