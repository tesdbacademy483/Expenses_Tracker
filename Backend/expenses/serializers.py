from rest_framework import serializers
from .models import Expense, SalaryExpense, TaxEntry


class SalaryExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryExpense
        fields = ["id", "expense", "month", "employee_count", "amount", "created_at"]
        read_only_fields = ["id", "created_at"]


class TaxEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxEntry
        fields = ["id", "expense", "tax_type", "amount", "month", "created_at"]
        read_only_fields = ["id", "created_at"]


class ExpenseSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    manager_name = serializers.CharField(source="manager.user.name", read_only=True)
    salary_detail = SalaryExpenseSerializer(read_only=True)
    tax_detail = TaxEntrySerializer(read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id", "manager", "branch", "branch_name", "manager_name",
            "type", "amount", "date", "description", "location", "created_at",
            "salary_detail", "tax_detail",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "manager": {"required": False},
            "branch": {"required": False},
        }

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        if user.role == "admin":
            if not attrs.get("manager") or not attrs.get("branch"):
                raise serializers.ValidationError(
                    "Admin must specify both 'manager' and 'branch' when creating an expense."
                )
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        # Manager creates their OWN expense — auto-filled, they calculate/enter it themselves
        if user.role == "manager":
            manager_profile = user.manager_profile
            validated_data["manager"] = manager_profile
            validated_data["branch"] = manager_profile.branch
        return super().create(validated_data)