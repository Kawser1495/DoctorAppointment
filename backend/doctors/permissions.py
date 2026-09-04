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
        
        
class IsApprovedDoctor(BasePermission):

    message = (
        "Your doctor account is waiting for admin approval."
    )

    def has_permission(self, request, view):

        user = request.user

        return (
            user.is_authenticated
            and user.role == "doctor"
            and user.doctor_status == "approved"
            and user.is_active
        )