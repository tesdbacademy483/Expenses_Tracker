from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, SalaryExpenseViewSet, TaxEntryViewSet

router = DefaultRouter()
router.register("salary", SalaryExpenseViewSet, basename="salary-expense")
router.register("tax", TaxEntryViewSet, basename="tax-entry")
router.register("", ExpenseViewSet, basename="expense")

urlpatterns = router.urls