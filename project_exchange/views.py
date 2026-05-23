from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import Project
from user.models import Organization, CustomUser, Group
from user.router import CUSTOMER, EXECUTOR



def dashboard_callback(request, context):
    organizations = (
        Organization.objects
        .annotate(
            total_projects=Count(
                "customuser__customer_projects",
                distinct=True
            ),
            under_inspection=Count(
                "customuser__customer_projects",
                filter=Q(
                    customuser__customer_projects__project_status="UNDER_INSPECTION"
                ),
                distinct=True
            ),
            looking_for_executor=Count(
                "customuser__customer_projects",
                filter=Q(
                    customuser__customer_projects__project_status="LOOKING_FOR_EXECUTOR"
                ),
                distinct=True
            ),
            in_progress=Count(
                "customuser__customer_projects",
                filter=Q(
                    customuser__customer_projects__project_status="IN_PROGRESS"
                ),
                distinct=True
            ),
            completed=Count(
                "customuser__customer_projects",
                filter=Q(
                    customuser__customer_projects__project_status="COMPLETED"
                ),
                distinct=True
            ),
            canceled=Count(
                "customuser__customer_projects",
                filter=Q(
                    customuser__customer_projects__project_status="CANCELED"
                ),
                distinct=True
            ),
        )
        .order_by("full_name")
    )

    organization_data = []
    group = get_object_or_404(Group, name=CUSTOMER)

    for organization in organizations:
        
        users = (
            CustomUser.objects
            .filter(organization=organization, groups=group)
            .annotate(
                total_projects=Count("customer_projects", distinct=True),
                under_inspection=Count(
                    "customer_projects",
                    filter=Q(customer_projects__project_status="UNDER_INSPECTION"),
                    distinct=True
                ),
                looking_for_executor=Count(
                    "customer_projects",
                    filter=Q(customer_projects__project_status="LOOKING_FOR_EXECUTOR"),
                    distinct=True
                ),
                in_progress=Count(
                    "customer_projects",
                    filter=Q(customer_projects__project_status="IN_PROGRESS"),
                    distinct=True
                ),
                completed=Count(
                    "customer_projects",
                    filter=Q(customer_projects__project_status="COMPLETED"),
                    distinct=True
                ),
                canceled=Count(
                    "customer_projects",
                    filter=Q(customer_projects__project_status="CANCELED"),
                    distinct=True
                ),
            )
            .order_by("last_name", "first_name")
        )

        organization_data.append({
            "organization": organization,
            "users": users,
        })

    group = get_object_or_404(Group, name=EXECUTOR)
    executors = (
        CustomUser.objects
        .filter(executor_projects__isnull=False, groups=group)
        .annotate(
            in_progress=Count(
                "executor_projects",
                filter=Q(executor_projects__project_status="IN_PROGRESS"),
                distinct=True
            ),
            completed=Count(
                "executor_projects",
                filter=Q(executor_projects__project_status="COMPLETED"),
                distinct=True
            ),
            total=Count("executor_projects", distinct=True),
        )
        .filter(total__gt=0)
        .order_by("last_name", "first_name")
    )

    context.update({
        "organization_data": organization_data,
        "executors": executors,
        "global_stats": {
            "total_projects": Project.objects.count(),
            "under_inspection": Project.objects.filter(
                project_status="UNDER_INSPECTION"
            ).count(),
            "looking_for_executor": Project.objects.filter(
                project_status="LOOKING_FOR_EXECUTOR"
            ).count(),
            "in_progress": Project.objects.filter(
                project_status="IN_PROGRESS"
            ).count(),
            "completed": Project.objects.filter(
                project_status="COMPLETED"
            ).count(),
            "canceled": Project.objects.filter(
                project_status="CANCELED"
            ).count(),
        }
    })

    return context