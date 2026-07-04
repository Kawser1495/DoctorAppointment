from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Accounts API
    path('api/', include('accounts.urls')),

    # Patients API
    path('api/patients/', include('patients.urls')),
]
