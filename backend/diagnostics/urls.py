from django.urls import path
from .views import TestBookingCreateView

urlpatterns = [
    path('book/', TestBookingCreateView.as_view(), name='test-booking'),
]