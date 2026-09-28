from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .views import UserViewSet
from .serializers import UserSerializer

router = DefaultRouter()
router.register("", UserViewSet, basename="user")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


urlpatterns = [
    path("me/", me, name="user-me"),
] + router.urls