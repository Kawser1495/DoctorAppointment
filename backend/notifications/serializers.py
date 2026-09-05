from rest_framework import serializers

from .models import Notification


# ==========================================================
# Notification Serializer
# ==========================================================

class NotificationSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Notification

        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "created_at",
            "updated_at",
        ]


class AdminNotificationSerializer(NotificationSerializer):

    user_name = serializers.SerializerMethodField()

    class Meta(NotificationSerializer.Meta):
        fields = NotificationSerializer.Meta.fields + [
            "user",
            "user_name",
        ]
        read_only_fields = NotificationSerializer.Meta.read_only_fields + [
            "user",
            "user_name",
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name().strip() or obj.user.username