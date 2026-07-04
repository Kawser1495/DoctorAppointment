from django.urls import path
from .views import AppointmentCreateView, AppointmentListView

urlpatterns = [
    path('book/', AppointmentCreateView.as_view(), name='book-appointment'),
    path('list/', AppointmentListView.as_view(), name='appointment-list'),
]