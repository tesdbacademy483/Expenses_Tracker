#from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import Expense, SalaryExpense, TaxEntry
from .serializers import ExpenseSerializer, SalaryExpenseSerializer, TaxEntrySerializer
from core.permissions import IsAdminOrManager
from core.mixins import BranchScopedQuerysetMixin


class ExpenseViewSet(BranchScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    Admins see/manage expenses across all branches.
    Managers see/manage only expenses for their own branch.
    """

    queryset = Expense.objects.select_related("branch", "manager__user").all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ["branch", "manager", "type", "date"]
    branch_field = "branch_id"


class SalaryExpenseViewSet(viewsets.ModelViewSet):
    queryset = SalaryExpense.objects.select_related("expense", "expense__branch").all()
    serializer_class = SalaryExpenseSerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "admin":
            return qs
        manager_profile = getattr(user, "manager_profile", None)
        if not manager_profile:
            return qs.none()
        return qs.filter(expense__branch_id=manager_profile.branch_id)


class TaxEntryViewSet(viewsets.ModelViewSet):
    queryset = TaxEntry.objects.select_related("expense", "expense__branch").all()
    serializer_class = TaxEntrySerializer
    permission_classes = [IsAdminOrManager]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "admin":
            return qs
        manager_profile = getattr(user, "manager_profile", None)
        if not manager_profile:
            return qs.none()
        return qs.filter(expense__branch_id=manager_profile.branch_id)
