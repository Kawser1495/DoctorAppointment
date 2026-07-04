from django.contrib import admin
from .models import PatientProfile, FamilyMember

admin.site.register(PatientProfile)
admin.site.register(FamilyMember)
