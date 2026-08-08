from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
)


app_name = "accounts"


urlpatterns = [

    # ======================================================
    # Register
    # POST /api/accounts/register/
    # ======================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # ======================================================
    # Login
    # POST /api/accounts/login/
    # ======================================================

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    # ======================================================
    # Refresh
    # POST /api/accounts/refresh/
    # ======================================================

    path(
        "refresh/",
        RefreshTokenView.as_view(),
        name="refresh",
    ),
]