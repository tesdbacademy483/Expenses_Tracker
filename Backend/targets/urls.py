from rest_framework.routers import DefaultRouter
from .views import TargetViewSet, TargetEntryViewSet

router = DefaultRouter()
router.register("entries", TargetEntryViewSet, basename="target-entry")  # /api/targets/entries/
router.register("", TargetViewSet, basename="target")                    # /api/targets/

urlpatterns = router.urls