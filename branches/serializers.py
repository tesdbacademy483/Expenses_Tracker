from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    manager_count = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = ["id", "name", "location", "is_active", "created_at", "manager_count"]
        read_only_fields = ["id", "created_at"]

    def get_manager_count(self, obj):
        return obj.manager_profiles.count()