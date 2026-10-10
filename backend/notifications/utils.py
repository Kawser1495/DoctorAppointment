from django.db.models import Q

from accounts.models import CustomUser

from .models import Notification


def create_admin_notification(*, notification_type, title, message):
    admins = CustomUser.objects.filter(
        Q(role="admin") | Q(is_superuser=True),
        is_active=True,
    ).distinct()

    for admin in admins:
        Notification.objects.create(
            user=admin,
            notification_type=notification_type,
            title=title,
            message=message,
            is_read=False,
        )