from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .models import CustomUser
from .serializers import RegisterSerializer


# ==========================================================
# Register API
# POST: /api/accounts/register/
# ==========================================================

class RegisterView(generics.CreateAPIView):

    queryset = CustomUser.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Login API
# POST: /api/accounts/login/
# ==========================================================

class LoginView(TokenObtainPairView):

    permission_classes = [
        AllowAny
    ]


# ==========================================================
# Refresh Token API
# POST: /api/accounts/refresh/
# ==========================================================

class RefreshTokenView(TokenRefreshView):

    permission_classes = [
        AllowAny
    ]