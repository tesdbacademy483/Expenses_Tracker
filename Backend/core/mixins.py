# class BranchScopedQuerysetMixin:
#     branch_field = "branch_id"  # override in subclasses if the FK path differs

#     def get_queryset(self):
#         qs = super().get_queryset()
#         user = self.request.user
#         if not user.is_authenticated:
#             return qs.none()
#         if user.role == "admin":
#             return qs
#         manager_profile = getattr(user, "manager_profile", None)
#         if not manager_profile:
#             return qs.none()
#         filter_kwargs = {self.branch_field: manager_profile.branch_id}
#         return qs.filter(**filter_kwargs)

class BranchScopedQuerysetMixin:
    branch_field = "branch_id"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            return qs.none()

        # Admin can see all targets
        if user.role == "admin":
            return qs

        # Get logged-in manager's profile
        manager_profile = getattr(user, "manager_profile", None)

        if not manager_profile:
            return qs.none()

        # Manager can see ONLY targets assigned to himself
        return qs.filter(manager=manager_profile)