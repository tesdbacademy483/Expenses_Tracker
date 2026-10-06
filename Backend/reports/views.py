# #from django.shortcuts import render

# # Create your views here.
# from django.db.models import Sum, Q
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from core.permissions import IsAdminOrManager
# from branches.models import Branch
# from targets.models import Target, TargetEntry
# from expenses.models import Expense


# def _branch_scope(user):
#     """Return a Branch queryset scoped to the requesting user's role."""
#     if user.role == "admin":
#         return Branch.objects.all()
#     manager_profile = getattr(user, "manager_profile", None)
#     if not manager_profile:
#         return Branch.objects.none()
#     return Branch.objects.filter(id=manager_profile.branch_id)


# class BranchSummaryReportView(APIView):
#     """
#     GET /api/reports/branch-summary/
#     Returns, per branch in scope: total target, total achieved,
#     achievement %, and total expenses broken down by type.
#     """

#     permission_classes = [IsAdminOrManager]

#     def get(self, request):
#         branches = _branch_scope(request.user)
#         result = []
#         for branch in branches:
#             entries = TargetEntry.objects.filter(target__branch=branch)
#             totals = entries.aggregate(
#                 total_target=Sum("target_amount"), total_achieved=Sum("achieved_amount")
#             )
#             total_target = totals["total_target"] or 0
#             total_achieved = totals["total_achieved"] or 0
#             achievement_pct = round((total_achieved / total_target) * 100, 2) if total_target else 0

#             expenses = Expense.objects.filter(branch=branch)
#             expense_totals = expenses.aggregate(
#                 salary=Sum("amount", filter=Q(type="salary")),
#                 tax=Sum("amount", filter=Q(type="tax")),
#                 other=Sum("amount", filter=Q(type="other")),
#             )

#             result.append({
#                 "branch_id": branch.id,
#                 "branch_name": branch.name,
#                 "location": branch.location,
#                 "total_target": total_target,
#                 "total_achieved": total_achieved,
#                 "achievement_percent": achievement_pct,
#                 "expenses": {
#                     "salary": expense_totals["salary"] or 0,
#                     "tax": expense_totals["tax"] or 0,
#                     "other": expense_totals["other"] or 0,
#                     "total": sum(filter(None, [
#                         expense_totals["salary"], expense_totals["tax"], expense_totals["other"]
#                     ])) or 0,
#                 },
#             })
#         return Response(result)


# class DashboardStatsView(APIView):
#     """
#     GET /api/reports/dashboard-stats/
#     High-level KPI cards for the logged-in user's dashboard.
#     """

#     permission_classes = [IsAdminOrManager]

#     def get(self, request):
#         branches = _branch_scope(request.user)
#         entries = TargetEntry.objects.filter(target__branch__in=branches)
#         expenses = Expense.objects.filter(branch__in=branches)

#         totals = entries.aggregate(
#             total_target=Sum("target_amount"), total_achieved=Sum("achieved_amount")
#         )
#         total_target = totals["total_target"] or 0
#         total_achieved = totals["total_achieved"] or 0
#         achievement_pct = round((total_achieved / total_target) * 100, 2) if total_target else 0
#         total_expenses = expenses.aggregate(total=Sum("amount"))["total"] or 0

#         return Response({
#             "branch_count": branches.count(),
#             "total_target": total_target,
#             "total_achieved": total_achieved,
#             "achievement_percent": achievement_pct,
#             "total_expenses": total_expenses,
#         })


from django.db.models import Sum, Q
from rest_framework.views import APIView
from rest_framework.response import Response

from core.permissions import IsAdminOrManager
from branches.models import Branch
from targets.models import Target, TargetEntry
from expenses.models import Expense


def _branch_scope(user):
    """
    Return branches available to the logged-in user.
    """

    if user.role == "admin":
        return Branch.objects.all()

    manager_profile = getattr(
        user,
        "manager_profile",
        None
    )

    if not manager_profile:
        return Branch.objects.none()

    return Branch.objects.filter(
        id=manager_profile.branch_id
    )


class BranchSummaryReportView(APIView):
    """
    GET /api/reports/branch-summary/

    Returns, per branch:
    - total target amount
    - total achieved amount
    - achievement percentage
    - expenses by type
    """

    permission_classes = [IsAdminOrManager]

    def get(self, request):

        branches = _branch_scope(request.user)

        result = []

        for branch in branches:

            # --------------------------------
            # TARGETS
            # --------------------------------

            targets = Target.objects.filter(
                branch=branch
            )

            total_target = targets.aggregate(
                total=Sum("target_amount")
            )["total"] or 0

            # --------------------------------
            # ACHIEVEMENTS
            # --------------------------------

            entries = TargetEntry.objects.filter(
                target__branch=branch
            )

            total_achieved = entries.aggregate(
                total=Sum("achieved_amount")
            )["total"] or 0

            # --------------------------------
            # ACHIEVEMENT %
            # --------------------------------

            achievement_pct = (
                round(
                    (float(total_achieved) / float(total_target)) * 100,
                    2
                )
                if total_target
                else 0
            )

            # --------------------------------
            # EXPENSES
            # --------------------------------

            expenses = Expense.objects.filter(
                branch=branch
            )

            expense_totals = expenses.aggregate(
                salary=Sum(
                    "amount",
                    filter=Q(type="salary")
                ),
                tax=Sum(
                    "amount",
                    filter=Q(type="tax")
                ),
                other=Sum(
                    "amount",
                    filter=Q(type="other")
                ),
            )

            salary = expense_totals["salary"] or 0
            tax = expense_totals["tax"] or 0
            other = expense_totals["other"] or 0

            total_expenses = (
                salary +
                tax +
                other
            )

            # --------------------------------
            # RESULT
            # --------------------------------

            result.append({
                "branch_id": branch.id,
                "branch_name": branch.name,
                "location": branch.location,

                "total_target": total_target,
                "total_achieved": total_achieved,
                "achievement_percent": achievement_pct,

                "expenses": {
                    "salary": salary,
                    "tax": tax,
                    "other": other,
                    "total": total_expenses,
                },
            })

        return Response(result)


class DashboardStatsView(APIView):
    """
    GET /api/reports/dashboard-stats/

    High-level KPI cards for the logged-in user's dashboard.
    """

    permission_classes = [IsAdminOrManager]

    def get(self, request):

        branches = _branch_scope(request.user)

        # --------------------------------
        # TARGETS
        # --------------------------------

        targets = Target.objects.filter(
            branch__in=branches
        )

        total_target = targets.aggregate(
            total=Sum("target_amount")
        )["total"] or 0

        # --------------------------------
        # ACHIEVEMENTS
        # --------------------------------

        entries = TargetEntry.objects.filter(
            target__branch__in=branches
        )

        total_achieved = entries.aggregate(
            total=Sum("achieved_amount")
        )["total"] or 0

        # --------------------------------
        # ACHIEVEMENT %
        # --------------------------------

        achievement_pct = (
            round(
                (float(total_achieved) / float(total_target)) * 100,
                2
            )
            if total_target
            else 0
        )

        # --------------------------------
        # EXPENSES
        # --------------------------------

        expenses = Expense.objects.filter(
            branch__in=branches
        )

        total_expenses = (
            expenses.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        # --------------------------------
        # RESPONSE
        # --------------------------------

        return Response({
            "branch_count": branches.count(),

            "total_target": total_target,

            "total_achieved": total_achieved,

            "achievement_percent": achievement_pct,

            "total_expenses": total_expenses,
        })