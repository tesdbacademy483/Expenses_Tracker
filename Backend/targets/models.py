# from django.db import models


# class Target(models.Model):
#     TYPE_CHOICES = (
#         ("daily", "Daily"),
#         ("monthly", "Monthly"),
#     )

#     # Set by ADMIN when assigning a target to a specific manager/branch
#     manager = models.ForeignKey(
#         "managers.ManagerProfile", on_delete=models.CASCADE, related_name="targets"
#     )
#     branch = models.ForeignKey(
#         "branches.Branch", on_delete=models.CASCADE, related_name="targets"
#     )
#     name = models.CharField(max_length=150)
#     location = models.CharField(max_length=200)
#     type = models.CharField(max_length=10, choices=TYPE_CHOICES)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "targets"
#         ordering = ["-created_at"]

#     def __str__(self):
#         return f"{self.name} [{self.type}] - {self.branch.name}"


# class TargetEntry(models.Model):
#     # This is the "Add Entry" record — target amount vs achieved amount
#     target = models.ForeignKey(Target, on_delete=models.CASCADE, related_name="entries")
#     date = models.DateField()
#     target_amount = models.DecimalField(max_digits=14, decimal_places=2)
#     achieved_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = "target_entries"
#         ordering = ["-date"]

#     @property
#     def achievement_percent(self):
#         # Auto-calculated — this is what shows on the manager dashboard
#         if self.target_amount == 0:
#             return 0
#         return round((self.achieved_amount / self.target_amount) * 100, 2)

#     def __str__(self):
#         return f"{self.target.name} - {self.date}"


from django.db import models


class Target(models.Model):
    TYPE_CHOICES = (
        ("daily", "Daily"),
        ("monthly", "Monthly"),
    )

    # Set by ADMIN when assigning a target
    manager = models.ForeignKey(
        "managers.ManagerProfile",
        on_delete=models.CASCADE,
        related_name="targets"
    )

    branch = models.ForeignKey(
        "branches.Branch",
        on_delete=models.CASCADE,
        related_name="targets"
    )

    name = models.CharField(max_length=150)

    location = models.CharField(max_length=200)

    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES
    )

    # Fixed target amount
    target_amount = models.DecimalField(
    max_digits=14,
    decimal_places=2,
    null=True,
    blank=True
    )

    start_date = models.DateField(
        null=True,
        blank=True
    )

    end_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "targets"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} [{self.type}] - {self.branch.name}"


class TargetEntry(models.Model):
    PAYMENT_CHOICES = (
        ("cash", "Cash"),
        ("card", "Card"),
    )


    # Target to which this achievement belongs
    target = models.ForeignKey(
        Target,
        on_delete=models.CASCADE,
        related_name="entries"
    )

    # Achievement entry date
    date = models.DateField()

    # Only achieved amount is entered here
    achieved_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0
    )

    payment_type = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        default="cash"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "target_entries"
        ordering = ["-date"]

    @property
    def achievement_percent(self):

        target_amount = self.target.target_amount

        if not target_amount or target_amount == 0:
            return 0

        return round(
            (self.achieved_amount / target_amount) * 100,
            2
        )

    def __str__(self):
        return f"{self.target.name} - {self.date}"
    
    