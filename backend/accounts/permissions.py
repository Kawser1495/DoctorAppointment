from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allow access only to authenticated users
    whose role is admin.
    """

    message = "Only administrators can access this resource."

    def has_permission(self, request, view):

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )