from django.urls import path
from .views import AppointmentCreateView, AppointmentListView, AppointmentCancelView

urlpatterns = [
    path('book/', AppointmentCreateView.as_view(), name='book-appointment'),
    path('list/', AppointmentListView.as_view(), name='appointment-list'),
    path('cancel/<int:pk>/', AppointmentCancelView.as_view(), name='cancel-appointment'),
]