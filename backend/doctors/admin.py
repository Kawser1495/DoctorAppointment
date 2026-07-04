from django.contrib import admin
from .models import Department, Doctor, DoctorSchedule, TimeSlot

admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(DoctorSchedule)
admin.site.register(TimeSlot)
