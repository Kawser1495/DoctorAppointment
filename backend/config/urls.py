from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path('api/patients/', include('patients.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/tests/', include('diagnostics.urls')),
    path('api/payments/', include('payments.urls')),
    path("api/dashboard/",include("dashboard.urls")),
]