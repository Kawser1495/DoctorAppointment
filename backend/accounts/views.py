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
    CustomTokenObtainPairSerializer,
)


# ==========================================================
# Register
#
# POST:
# /api/accounts/register/
#
# Creates:
# - CustomUser
# - PatientProfile or Doctor
# - DoctorSchedule for doctors
# ==========================================================

class RegisterView(generics.CreateAPIView):

    queryset = CustomUser.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        # Invalid data হলে DRF automatically
        # field-wise error response পাঠাবে।
        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "success": True,
                "message": (
                    "Registration successful. "
                    "You can now log in."
                ),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ==========================================================
# Login
#
# POST:
# /api/accounts/login/
#
# Returns:
# - access
# - refresh
# - user information
# - role
# ==========================================================

class LoginView(TokenObtainPairView):

    serializer_class = (
        CustomTokenObtainPairSerializer
    )

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Refresh Token
#
# POST:
# /api/accounts/refresh/
# ==========================================================

class RefreshTokenView(TokenRefreshView):

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

    def get_object(self):

        return self.request.user


# ==========================================================
# Change Password
#
# POST:
# /api/accounts/change-password/
# ==========================================================

class ChangePasswordView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={
                "request": request
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

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

        return Response(
            {
                "success": True,
                "message":
                "Password changed successfully.",
            },
            status=status.HTTP_200_OK,
        )