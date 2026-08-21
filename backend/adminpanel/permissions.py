from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):

    """
    Permission for custom admin panel.

    Access is allowed only when:
    - User is authenticated
    - AND user.is_staff is True
      OR user.role is "admin"
    """

    message = "Admin access required."

    def has_permission(self, request, view):

        user = request.user

        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or getattr(user, "role", None) == "admin"
            )
        )