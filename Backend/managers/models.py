#from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings


class ManagerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="manager_profile"
    )
    branch = models.ForeignKey(
        "branches.Branch", on_delete=models.CASCADE, related_name="manager_profiles"
    )
    location = models.CharField(max_length=200)
    
    designation = models.CharField(max_length=100, default="Branch Manager")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "manager_profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.name} - {self.branch.name}"