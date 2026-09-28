from django.urls import path
from .views import BranchSummaryReportView, DashboardStatsView

urlpatterns = [
    path("branch-summary/", BranchSummaryReportView.as_view(), name="branch-summary"),
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
]