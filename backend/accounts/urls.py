from django.urls import path
from .views import RegisterView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Register API
    path('register/', RegisterView.as_view(), name='register'),

    # Login API (JWT)
    path('login/', TokenObtainPairView.as_view(), name='login'),

    # Refresh Access Token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]