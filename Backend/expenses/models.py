#from django.db import models

# Create your models here.

from django.db import models


class Expense(models.Model):
    TYPE_CHOICES = (
        ("salary", "Salary"),
        ("tax", "Tax"),
        ("other", "Other"),
    )

    manager = models.ForeignKey(
        "managers.ManagerProfile", on_delete=models.CASCADE, related_name="expenses"
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="expenses"
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "expenses"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.branch.name})"


class SalaryExpense(models.Model):
    expense = models.OneToOneField(Expense, on_delete=models.CASCADE, related_name="salary_detail")
    month = models.DateField(help_text="Use the first day of the month, e.g. 2026-09-01")
    employee_count = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "salary_expenses"
        ordering = ["-month"]

    def __str__(self):
        return f"Salary {self.month} - {self.amount}"


class TaxEntry(models.Model):
    expense = models.OneToOneField(Expense, on_delete=models.CASCADE, related_name="tax_detail")
    tax_type = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    month = models.DateField(help_text="Use the first day of the month, e.g. 2026-09-01")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tax_entries"
        ordering = ["-month"]

    def __str__(self):
        return f"{self.tax_type} - {self.amount}"
