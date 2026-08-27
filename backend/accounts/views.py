from rest_framework import generics, status

from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from rest_framework.response import Response

from rest_framework.views import APIView


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


from .models import CustomUser

from .serializers import (
    RegisterSerializer,
    UserSettingsSerializer,
    ChangePasswordSerializer,
)


# ==========================================================
# Register
#
# POST:
# /api/accounts/register/
# ==========================================================

class RegisterView(
    generics.CreateAPIView
):

    queryset = CustomUser.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Login
#
# POST:
# /api/accounts/login/
# ==========================================================

class LoginView(
    TokenObtainPairView
):

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Refresh Token
#
# POST:
# /api/accounts/refresh/
# ==========================================================

class RefreshTokenView(
    TokenRefreshView
):

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# User Settings
#
# GET:
# /api/accounts/settings/
#
# PATCH:
# /api/accounts/settings/
#
# User can view and update their own settings.
# ==========================================================

class UserSettingsView(
    generics.RetrieveUpdateAPIView
):

    serializer_class = UserSettingsSerializer

    permission_classes = [
        IsAuthenticated
    ]


    # ======================================================
    # Current Logged-in User
    # ======================================================

    def get_object(self):

        return self.request.user


# ==========================================================
# Change Password
#
# POST:
# /api/accounts/change-password/
#
# Required:
#
# {
#     "current_password": "...",
#     "new_password": "...",
#     "confirm_password": "..."
# }
# ==========================================================

class ChangePasswordView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]


    def post(
        self,
        request
    ):

        # ==================================================
        # Validate Request
        # ==================================================

        serializer = ChangePasswordSerializer(

            data=request.data,

            context={
                "request": request
            },

        )


        serializer.is_valid(
            raise_exception=True
        )


        # ==================================================
        # Change Password
        # ==================================================

        request.user.set_password(

            serializer.validated_data[
                "new_password"
            ]

        )


        request.user.save(

            update_fields=[
                "password",
                "updated_at",
            ]

        )


        # ==================================================
        # Response
        # ==================================================

        return Response(

            {

                "success": True,

                "message":
                "Password changed successfully."

            },

            status=status.HTTP_200_OK

        )

