from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Accounts API
    path('api/', include('accounts.urls')),

    # Patients API
    path('api/patients/', include('patients.urls')),

    # Doctors API
    path('api/doctors/', include('doctors.urls')),
]