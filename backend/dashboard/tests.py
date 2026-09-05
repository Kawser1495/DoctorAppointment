from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AdminDashboardPermissionTests(APITestCase):

	def test_only_admin_can_access_dashboard_endpoint(self):

		for role in [
			"patient",
			"doctor",
			"receptionist",
		]:
			user = User.objects.create_user(
				username=f"{role}_user",
				password="test-password-123",
				role=role,
				is_active=True,
			)

			self.client.force_authenticate(user=user)

			response = self.client.get("/api/dashboard/")

			self.assertEqual(
				response.status_code,
				status.HTTP_403_FORBIDDEN,
			)

	def test_admin_can_access_dashboard_endpoint(self):

		admin = User.objects.create_user(
			username="dashboard_admin",
			password="test-password-123",
			role="admin",
			is_active=True,
		)

		self.client.force_authenticate(user=admin)

		response = self.client.get("/api/dashboard/")

		self.assertEqual(
			response.status_code,
			status.HTTP_200_OK,
		)

		self.assertTrue(response.data["success"])

	def test_non_admin_cannot_access_admin_payment_endpoint(self):

		for role in [
			"patient",
			"doctor",
			"receptionist",
		]:
			user = User.objects.create_user(
				username=f"payment_{role}",
				password="test-password-123",
				role=role,
				is_active=True,
			)

			self.client.force_authenticate(user=user)

			response = self.client.get("/api/payments/admin/")

			self.assertEqual(
				response.status_code,
				status.HTTP_403_FORBIDDEN,
			)

# Create your tests here.
