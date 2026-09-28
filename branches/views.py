#from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import Branch
from .serializers import BranchSerializer
from core.permissions import IsAdmin, IsAdminOrManager


class BranchViewSet(viewsets.ModelViewSet):
    """
    Admins: full CRUD over all branches.
    Managers: read-only access to branches (needed for dropdowns/context).
    """

    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAdminOrManager()]
        return [IsAdmin()]
