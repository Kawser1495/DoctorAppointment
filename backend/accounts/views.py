from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .models import CustomUser
from .serializers import RegisterSerializer


# ==========================
# Register API
# ==========================
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ==========================
# Login API (JWT)
# ==========================
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


# ==========================
# Refresh Token API
# ==========================
class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]