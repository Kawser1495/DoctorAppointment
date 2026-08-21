from rest_framework.permissions import BasePermission


# ==========================================================
# Admin Permission
# ==========================================================

class IsAdminUser(BasePermission):

    message = "Admin access required."

    def has_permission(self, request, view):

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# ==========================================================
# Doctor Permission
# ==========================================================

class IsDoctorUser(BasePermission):

    message = "Doctor access required."

    def has_permission(self, request, view):

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "doctor"
            and hasattr(request.user, "doctor_profile")
        )