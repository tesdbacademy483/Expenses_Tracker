#from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.response import Response
from .models import ManagerProfile
from .serializers import ManagerProfileSerializer, ManagerCreateSerializer
from core.permissions import IsAdmin, IsAdminOrManager


class ManagerViewSet(viewsets.ModelViewSet):
    """
    Admins: full CRUD - create/manage branch managers.
    Managers: read-only, limited to their own profile.
    """

    queryset = ManagerProfile.objects.select_related("user", "branch").all()

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "admin":
            return qs
        return qs.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return ManagerCreateSerializer
        return ManagerProfileSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAdminOrManager()]
        return [IsAdmin()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(ManagerProfileSerializer(profile).data, status=201)