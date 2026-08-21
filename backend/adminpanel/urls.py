from django.urls import path

from .views import (
    AdminDashboardAPIView,
)


app_name = "adminpanel"


urlpatterns = [

    # ======================================================
    # Admin Dashboard
    #
    # GET:
    # /api/admin/dashboard/
    # ======================================================

    path(
        "dashboard/",
        AdminDashboardAPIView.as_view(),
        name="admin-dashboard",
    ),

]