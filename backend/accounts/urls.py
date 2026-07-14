from django.urls import path
from .views import RegisterView, LoginView, RefreshTokenView

urlpatterns = [
    # Register API
    path("register/", RegisterView.as_view(), name="register"),

    # Login API
    path("login/", LoginView.as_view(), name="login"),

    # Refresh Token API
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
]