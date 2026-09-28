#from django.db import models

# Create your models here.

from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "branches"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.location})"
