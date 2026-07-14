from rest_framework import serializers

class DashboardSerializer(serializers.Serializer):

    total_doctors = serializers.IntegerField()

    total_patients = serializers.IntegerField()

    total_appointments = serializers.IntegerField()

    pending_appointments = serializers.IntegerField()

    completed_appointments = serializers.IntegerField()

    cancelled_appointments = serializers.IntegerField()

    total_reports = serializers.IntegerField()

    total_payments = serializers.DecimalField(max_digits=10, decimal_places=2)