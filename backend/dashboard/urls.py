from django.urls import path

from .views import DashboardAPIView


app_name = "dashboard"


urlpatterns = [

    # ==========================================================
    # Dashboard
    # GET: /api/dashboard/
    # ==========================================================

    path(
        "",
        DashboardAPIView.as_view(),
        name="dashboard",
    ),

]