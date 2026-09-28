"""
Shared role-based access control (RBAC) permission classes.

Roles:
- admin: full access across all branches
- manager: scoped access to their own branch's data only
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsManager(permissions.BasePermission):
    """Allows access only to manager users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "manager"
        )


class IsAdminOrManager(permissions.BasePermission):
    """Allows access to any authenticated admin or manager."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "manager")
        )


class IsAdminOrReadOnlyOwnBranch(permissions.BasePermission):
    """
    Admins can do anything.
    Managers can only read/write objects scoped to their own branch.
    Object must expose a `branch_id` attribute (directly or via FK).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        manager_profile = getattr(request.user, "manager_profile", None)
        if not manager_profile:
            return False
        obj_branch_id = getattr(obj, "branch_id", None)
        return obj_branch_id == manager_profile.branch_id