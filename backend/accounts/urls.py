from django.urls import path


from .views import (
    RegisterView,
    LoginView,
    RefreshTokenView,
    UserSettingsView,
    ChangePasswordView,
)


app_name = "accounts"


urlpatterns = [

    # ======================================================
    # Register
    #
    # POST:
    # /api/accounts/register/
    # ======================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),


    # ======================================================
    # Login
    #
    # POST:
    # /api/accounts/login/
    # ======================================================

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),


    # ======================================================
    # Refresh Token
    #
    # POST:
    # /api/accounts/refresh/
    # ======================================================

    path(
        "refresh/",
        RefreshTokenView.as_view(),
        name="refresh",
    ),


    # ======================================================
    # User Settings
    #
    # GET:
    # /api/accounts/settings/
    #
    # PATCH:
    # /api/accounts/settings/
    # ======================================================

    path(
        "settings/",
        UserSettingsView.as_view(),
        name="user-settings",
    ),


    # ======================================================
    # Change Password
    #
    # POST:
    # /api/accounts/change-password/
    # ======================================================

    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

]
