from django.db import models


class Target(models.Model):
    TYPE_CHOICES = (
        ("daily", "Daily"),
        ("monthly", "Monthly"),
    )

    # Set by ADMIN when assigning a target to a specific manager/branch
    manager = models.ForeignKey(
        "managers.ManagerProfile", on_delete=models.CASCADE, related_name="targets"
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="targets"
    )
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "targets"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} [{self.type}] - {self.branch.name}"


class TargetEntry(models.Model):
    # This is the "Add Entry" record — target amount vs achieved amount
    target = models.ForeignKey(Target, on_delete=models.CASCADE, related_name="entries")
    date = models.DateField()
    target_amount = models.DecimalField(max_digits=14, decimal_places=2)
    achieved_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "target_entries"
        ordering = ["-date"]

    @property
    def achievement_percent(self):
        # Auto-calculated — this is what shows on the manager dashboard
        if self.target_amount == 0:
            return 0
        return round((self.achieved_amount / self.target_amount) * 100, 2)

    def __str__(self):
        return f"{self.target.name} - {self.date}"