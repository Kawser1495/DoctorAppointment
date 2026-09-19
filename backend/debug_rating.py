import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from datetime import date
from django.contrib.auth import get_user_model
from doctors.models import Department, Doctor, DoctorSchedule, TimeSlot
from doctors.serializers import DoctorRatingSerializer
from appointments.models import Appointment

User = get_user_model()

def main():
    u1 = User.objects.create_user(username='docratingdebug', email='docratingdebug@test.com', password='x', role='doctor', phone='1111111', is_verified=True)
    d = Department.objects.create(name='DebugCardio', description='cardio')
    doc = Doctor.objects.create(user=u1, department=d, specialization='Cardio', qualification='MD', experience=10, consultation_fee='100.00')
    u2 = User.objects.create_user(username='patdebug', email='patdebug@test.com', password='x', role='patient', phone='2222222', is_verified=True)
    patient = u2.patient_profile
    sched = DoctorSchedule.objects.create(doctor=doc, day='Monday', start_time='09:00:00', end_time='10:00:00', slot_duration_minutes=30, max_patient_per_slot=5)
    slot = TimeSlot.objects.create(schedule=sched, slot_time='09:00:00', max_patient=5)
    apt = Appointment.objects.create(patient=patient, doctor=doc, slot=slot, appointment_date=date.today(), reason='Need care', status='Completed')
    serializer = DoctorRatingSerializer(data={'appointment': apt.id, 'rating': 5, 'review': 'Great'}, context={'request': type('Req', (), {'user': u2})()})
    valid = serializer.is_valid()
    print('IS_VALID', valid)
    print('ERRORS', serializer.errors)
    print('PATIENT_PROFILE_ID', u2.patient_profile.id)
    print('APT_PATIENT_ID', apt.patient_id)
    print('APT_STATUS', apt.status)

if __name__ == '__main__':
    main()
