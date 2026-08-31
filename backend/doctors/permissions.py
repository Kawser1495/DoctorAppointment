from rest_framework.permissions import BasePermission


# ==========================================================
# Base Role Permission
# ==========================================================

class BaseRolePermission(BasePermission):

    required_role = None

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Admin / Superuser can access everything
        if user.is_superuser:
            return True

        # Check required role
        return user.role == self.required_role


# ==========================================================
# Doctor Permission
# ==========================================================

class IsDoctor(BaseRolePermission):

    required_role = "doctor"


# ==========================================================
# Patient Permission
# ==========================================================

class IsPatient(BaseRolePermission):

    required_role = "patient"


# ==========================================================
# Admin Permission
# ==========================================================

class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        return (
            user.is_superuser
            or user.is_staff
            or user.role == "admin"
        )