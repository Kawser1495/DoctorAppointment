from rest_framework import serializers

from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:

        model = CustomUser

        fields = [
            "username",
            "email",
            "phone",
            "password",
        ]

        extra_kwargs = {
            "username": {
                "required": True,
            },
            "email": {
                "required": True,
            },
            "phone": {
                "required": True,
            },
        }

    def create(self, validated_data):

        return CustomUser.objects.create_user(
            role="patient",
            **validated_data,
        )