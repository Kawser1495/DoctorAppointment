from django.urls import path
from .views import DoctorListView, DepartmentListView

urlpatterns = [
    path('list/', DoctorListView.as_view(), name='doctor-list'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
]