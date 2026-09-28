#from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import Target, TargetEntry
from .serializers import TargetSerializer, TargetEntrySerializer
from core.permissions import IsAdminOrManager
from core.mixins import BranchScopedQuerysetMixin


class TargetViewSet(BranchScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    Admins see/manage targets across all branches.
    Managers see/manage only targets for their own branch.
    """

    queryset = Target.objects.select_related("branch", "manager__user").all()
    serializer_class = TargetSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ["branch", "manager", "type"]
    branch_field = "branch_id"


class TargetEntryViewSet(viewsets.ModelViewSet):
    """
    Admins see/manage all target entries.
    Managers see/manage only entries for targets in their own branch.
    """

    queryset = TargetEntry.objects.select_related("target", "target__branch").all()
    serializer_class = TargetEntrySerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ["target", "date"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "admin":
            return qs
        manager_profile = getattr(user, "manager_profile", None)
        if not manager_profile:
            return qs.none()
        return qs.filter(target__branch_id=manager_profile.branch_id)