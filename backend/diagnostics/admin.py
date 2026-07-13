from django.contrib import admin
from .models import TestCategory, DiagnosticTest, TestBooking


admin.site.register(TestCategory)
admin.site.register(DiagnosticTest)
admin.site.register(TestBooking)
