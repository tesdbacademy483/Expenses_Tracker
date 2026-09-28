from rest_framework import serializers
from django.db import transaction
from .models import ManagerProfile
from accounts.models import User
from accounts.serializers import UserSerializer
from branches.models import Branch
from branches.serializers import BranchSerializer


class ManagerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    branch = BranchSerializer(read_only=True)

    class Meta:
        model = ManagerProfile
        fields = ["id", "user", "branch", "designation", "created_at"]
        read_only_fields = ["id", "created_at"]


class ManagerCreateSerializer(serializers.Serializer):
    """Creates a User (role=manager) + ManagerProfile in one call."""

    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    branch_id = serializers.PrimaryKeyRelatedField(
        queryset=Branch.objects.all(),
        source="branch",
    )
    designation = serializers.CharField(max_length=100, required=False, default="Branch Manager")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        branch = validated_data.pop("branch")
        designation = validated_data.pop("designation", "Branch Manager")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=password,
            role="manager",
        )
        return ManagerProfile.objects.create(user=user, branch=branch, designation=designation)