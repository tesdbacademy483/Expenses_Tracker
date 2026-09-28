from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "password", "is_active"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user role/name/branch info to the JWT and login response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["name"] = user.name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        manager_profile = getattr(self.user, "manager_profile", None)
        data["user"] = {
            "id": self.user.id,
            "name": self.user.name,
            "email": self.user.email,
            "role": self.user.role,
            "branch_id": manager_profile.branch_id if manager_profile else None,
            "branch_name": manager_profile.branch.name if manager_profile else None,
        }
        return data