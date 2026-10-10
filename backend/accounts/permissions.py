from rest_framework.permissions import BasePermission


# ==========================================================
# Doctor Permission
# ==========================================================

class IsDoctor(BasePermission):

    message = "Only authenticated doctors are allowed to access this resource."

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        return bool(

            user

            and

            user.is_authenticated

            and

            user.is_active

            and

            user.role == "doctor"

            and

            user.doctor_status == "approved"

            and

            user.is_verified

        )


# ==========================================================
# Patient Permission
# ==========================================================

class IsPatient(BasePermission):

    message = "Only authenticated patients are allowed to access this resource."

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        return bool(

            user

            and

            user.is_authenticated

            and

            user.is_active

            and

            user.role == "patient"

        )


# ==========================================================
# Receptionist Permission
# ==========================================================

class IsReceptionist(BasePermission):

    message = (
        "Only authenticated receptionists "
        "are allowed to access this resource."
    )

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        return bool(

            user

            and

            user.is_authenticated

            and

            user.is_active

            and

            user.role == "receptionist"

        )


# ==========================================================
# Admin Permission
# ==========================================================

class IsAdmin(BasePermission):

    message = "Only administrators are allowed to access this resource."

    def has_permission(
        self,
        request,
        view
    ):

        user = request.user

        return bool(

            user

            and

            user.is_authenticated

            and

            user.is_active

            and

            (

                user.role == "admin"

                or

                user.is_superuser

            )

        )


class IsAdminOrReceptionist(BasePermission):
    message = "Only administrators or receptionists are allowed to access this resource."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and (user.role == "receptionist" or user.role == "admin" or user.is_superuser)
        )