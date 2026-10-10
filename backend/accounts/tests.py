from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser
from doctors.models import Doctor


class DoctorApprovalLoginTests(APITestCase):

	def test_pending_doctor_cannot_login(self):
		user = CustomUser.objects.create_user(
			username="pending_doctor",
			password="StrongPass123!",
			role="doctor",
			is_active=False,
			is_verified=False,
			doctor_status="pending",
		)
		Doctor.objects.create(user=user, approval_status="pending")

		response = self.client.post(
			"/api/accounts/login/",
			{"username": "pending_doctor", "password": "StrongPass123!"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

	def test_approved_doctor_can_login(self):
		user = CustomUser.objects.create_user(
			username="approved_doctor",
			password="StrongPass123!",
			role="doctor",
			is_active=True,
			is_verified=True,
			doctor_status="approved",
		)
		Doctor.objects.create(user=user, approval_status="approved")

		response = self.client.post(
			"/api/accounts/login/",
			{"username": "approved_doctor", "password": "StrongPass123!"},
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn("access", response.data)
