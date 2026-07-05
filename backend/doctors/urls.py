from django.urls import path
from .views import DoctorListView, DepartmentListView, DoctorSearchView, DoctorByDepartmentView

urlpatterns = [
    path('list/', DoctorListView.as_view(), name='doctor-list'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
    path('search/', DoctorSearchView.as_view(), name='doctor-search'),
    path('departments/<int:department_id>/', DoctorByDepartmentView.as_view(), name='doctor-by-department'),
]