from django.urls import path

from .views import DashboardAPIView


app_name = "dashboard"


urlpatterns = [

    # ==========================================================
    # Dashboard API
    #
    # GET:
    # /api/dashboard/
    #
    # Authentication:
    # Required
    #
    # Dashboard depends on user role:
    # - Patient
    # - Doctor
    # - Admin
    # - Receptionist
    # ==========================================================

    path(
        "",
        DashboardAPIView.as_view(),
        name="dashboard",
    ),

]