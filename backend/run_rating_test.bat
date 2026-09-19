@echo off
cd /d "f:\DoctorAppointment\DoctorAppointment\backend"
.\venv\Scripts\python.exe manage.py test doctors.tests.DoctorRatingSerializerTests --verbosity 2
