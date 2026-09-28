from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/accounts/', include('accounts.urls')),
    path('api/branches/', include('branches.urls')),
    path('api/managers/', include('managers.urls')),
    path('api/targets/', include('targets.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/reports/', include('reports.urls')),
]