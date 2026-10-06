# from rest_framework import serializers
# from .models import Target, TargetEntry


# class TargetEntrySerializer(serializers.ModelSerializer):
#     achievement_percent = serializers.ReadOnlyField()  # sent to frontend automatically

#     class Meta:
#         model = TargetEntry
#         fields = [
#             "id", "target", "date", "target_amount", "achieved_amount",
#             "achievement_percent", "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]


# class TargetSerializer(serializers.ModelSerializer):
#     branch_name = serializers.CharField(source="branch.name", read_only=True)
#     manager_name = serializers.CharField(source="manager.user.name", read_only=True)
#     entries = TargetEntrySerializer(many=True, read_only=True)  # all "Add Entry" history nested here

#     class Meta:
#         model = Target
#         fields = [
#             "id", "manager", "branch", "branch_name", "manager_name", "location",   
#             "name", "type", "created_at", "entries",
#         ]
#         read_only_fields = ["id", "created_at"]
#         extra_kwargs = {
#             "manager": {"required": False},
#             "branch": {"required": False},
#         }

#     def validate(self, attrs):
#         request = self.context["request"]
#         user = request.user
#         # ADMIN must pick which manager/branch this target belongs to
#         if user.role == "admin":
#             if not attrs.get("manager") or not attrs.get("branch"):
#                 raise serializers.ValidationError(
#                     "Admin must specify both 'manager' and 'branch' when creating a target."
#                 )
#         return attrs

#     def create(self, validated_data):
#         request = self.context["request"]
#         user = request.user
#         # MANAGER can never set branch/manager manually — auto-filled from their own login
#         if user.role == "manager":
#             manager_profile = user.manager_profile
#             validated_data["manager"] = manager_profile
#             validated_data["branch"] = manager_profile.branch
#         return super().create(validated_data)



from rest_framework import serializers
from .models import Target, TargetEntry


class TargetEntrySerializer(serializers.ModelSerializer):

    achievement_percent = serializers.ReadOnlyField()

    class Meta:
        model = TargetEntry

        fields = [
            "id",
            "target",
            "date",
            "achieved_amount",
            "payment_type",
            "achievement_percent",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "achievement_percent",
        ]


class TargetSerializer(serializers.ModelSerializer):
    

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    manager_name = serializers.CharField(
        source="manager.user.name",
        read_only=True
    )

    entries = TargetEntrySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Target

        fields = [
            "id",
            "manager",
            "branch",
            "branch_name",
            "manager_name",
            "location",
            "name",
            "type",
            "target_amount",
            "start_date",
            "end_date",
            "created_at",
            "entries",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

        extra_kwargs = {
            "manager": {"required": False},
            "branch": {"required": False},
        }

    def validate(self, attrs):

        request = self.context["request"]
        user = request.user

        # Admin must select manager and branch
        if user.role == "admin":

            if not attrs.get("manager") or not attrs.get("branch"):
                raise serializers.ValidationError(
                    "Admin must specify both 'manager' and 'branch' when creating a target."
                )

        # Validate dates
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if start_date and end_date:

            if end_date < start_date:
                raise serializers.ValidationError(
                    "End date cannot be before start date."
                )

        return attrs

    def create(self, validated_data):

        request = self.context["request"]
        user = request.user

        # Manager cannot manually select branch/manager
        if user.role == "manager":

            manager_profile = user.manager_profile

            validated_data["manager"] = manager_profile
            validated_data["branch"] = manager_profile.branch

        return super().create(validated_data)