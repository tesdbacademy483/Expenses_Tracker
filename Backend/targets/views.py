from rest_framework import viewsets
from .models import Target, TargetEntry
from .serializers import TargetSerializer, TargetEntrySerializer
from core.permissions import IsAdminOrManager
from core.mixins import BranchScopedQuerysetMixin


class TargetViewSet(BranchScopedQuerysetMixin, viewsets.ModelViewSet):
    """
    Admin: sees/creates targets for ANY branch.
    Manager: sees ONLY targets belonging to their own branch —
             this is what makes the manager dashboard show only
             "their" target, automatically.
    """
    queryset = Target.objects.select_related("branch", "manager__user").all()
    serializer_class = TargetSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ["branch", "manager", "type"]
    branch_field = "branch_id"


class TargetEntryViewSet(viewsets.ModelViewSet):
    """
    This is the "Add Entry" endpoint the manager dashboard calls
    when the manager clicks "Add Entry" to record achieved amount.
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
        # Manager can only add entries to targets in their own branch
        return qs.filter(target__branch_id=manager_profile.branch_id)