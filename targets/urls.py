from rest_framework.routers import DefaultRouter
from .views import TargetViewSet, TargetEntryViewSet

router = DefaultRouter()
router.register("entries", TargetEntryViewSet, basename="target-entry")
router.register("", TargetViewSet, basename="target")

urlpatterns = router.urls