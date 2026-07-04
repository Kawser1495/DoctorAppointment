from django.urls import path
from .views import PaymentCreateView, PaymentListView

urlpatterns = [
    path('pay/', PaymentCreateView.as_view(), name='payment-create'),
    path('history/', PaymentListView.as_view(), name='payment-history'),
]