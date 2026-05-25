from django.db.models import Count, Q
from django.shortcuts import get_object_or_404

from .models import Project, Response
from user.models import Organization, CustomUser, Group
from user.router import CUSTOMER, EXECUTOR


def dashboard_callback(request, context):
    date_from_str = request.GET.get("date_from", "")
    date_to_str   = request.GET.get("date_to", "")
    all_time      = request.GET.get("all_time", "1")

    date_filter = Q()
    if all_time != "1" and date_from_str and date_to_str:
        try:
            from datetime import datetime
            date_from = datetime.strptime(date_from_str, "%Y-%m-%d")
            date_to   = datetime.strptime(date_to_str, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )
            date_filter = Q(created_at__range=(date_from, date_to))
        except ValueError:
            pass

    project_ids = list(Project.objects.filter(date_filter).values_list("id", flat=True))
    projects_qs = Project.objects.filter(date_filter)

    organizations = (
        Organization.objects
        .annotate(
            total_projects=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids),
                distinct=True
            ),
            under_inspection=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids,
                         customuser__customer_projects__project_status="UNDER_INSPECTION"),
                distinct=True
            ),
            looking_for_executor=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids,
                         customuser__customer_projects__project_status="LOOKING_FOR_EXECUTOR"),
                distinct=True
            ),
            in_progress=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids,
                         customuser__customer_projects__project_status="IN_PROGRESS"),
                distinct=True
            ),
            completed=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids,
                         customuser__customer_projects__project_status="COMPLETED"),
                distinct=True
            ),
            canceled=Count(
                "customuser__customer_projects",
                filter=Q(customuser__customer_projects__in=project_ids,
                         customuser__customer_projects__project_status="CANCELED"),
                distinct=True
            ),
        )
        .order_by("-total_projects", "full_name")
    )

    customer_group = get_object_or_404(Group, name=CUSTOMER)
    organization_data = []

    for organization in organizations:
        users = (
            CustomUser.objects
            .filter(organization=organization, groups=customer_group)
            .annotate(
                total_projects=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids), distinct=True),
                under_inspection=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids,
                             customer_projects__project_status="UNDER_INSPECTION"), distinct=True),
                looking_for_executor=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids,
                             customer_projects__project_status="LOOKING_FOR_EXECUTOR"), distinct=True),
                in_progress=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids,
                             customer_projects__project_status="IN_PROGRESS"), distinct=True),
                completed=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids,
                             customer_projects__project_status="COMPLETED"), distinct=True),
                canceled=Count("customer_projects",
                    filter=Q(customer_projects__in=project_ids,
                             customer_projects__project_status="CANCELED"), distinct=True),
            )
            .order_by("-total_projects", "last_name", "first_name")
        )
        organization_data.append({"organization": organization, "users": users})

    executor_group = get_object_or_404(Group, name=EXECUTOR)

    executors = (
        CustomUser.objects
        .filter(groups=executor_group)
        .annotate(
            total_responses=Count("executor_responses",
                filter=Q(executor_responses__project__in=project_ids), distinct=True),
            in_progress=Count("executor_projects",
                filter=Q(executor_projects__in=project_ids,
                         executor_projects__project_status="IN_PROGRESS"), distinct=True),
            completed=Count("executor_projects",
                filter=Q(executor_projects__in=project_ids,
                         executor_projects__project_status="COMPLETED"), distinct=True),
        )
        .filter(Q(total_responses__gt=0) | Q(in_progress__gt=0) | Q(completed__gt=0))
        .order_by("last_name", "first_name")
    )
    executors = sorted(
        executors,
        key=lambda ex: (-(ex.total_responses + ex.in_progress + ex.completed), ex.last_name, ex.first_name)
    )

    categories_qs = (
        projects_qs
        .values("category_project__name")
        .annotate(total=Count("id"))
        .order_by("-total")
    )
    total_cat = sum(c["total"] for c in categories_qs)
    categories_top = list(categories_qs[:5])
    top5_cat_total = sum(c["total"] for c in categories_top)
    other_cat = total_cat - top5_cat_total
    categories = [
        {
            "name": c["category_project__name"] or "Без категории",
            "total": c["total"],
            "pct": round(c["total"] / total_cat * 100) if total_cat else 0,
        }
        for c in categories_top
    ]
    if other_cat > 0:
        categories.append({
            "name": "Остальные",
            "total": other_cat,
            "pct": round(other_cat / total_cat * 100) if total_cat else 0,
        })

    technologies_qs = (
        projects_qs
        .values("technologies__name")
        .annotate(total=Count("id", distinct=True))
        .filter(technologies__isnull=False)
        .order_by("-total")
    )
    total_tech = sum(t["total"] for t in technologies_qs)
    technologies_top = list(technologies_qs[:5])
    top5_tech_total = sum(t["total"] for t in technologies_top)
    other_tech = total_tech - top5_tech_total
    technologies = [
        {
            "name": t["technologies__name"],
            "total": t["total"],
            "pct": round(t["total"] / total_tech * 100) if total_tech else 0,
        }
        for t in technologies_top
    ]
    if other_tech > 0:
        technologies.append({
            "name": "Остальные",
            "total": other_tech,
            "pct": round(other_tech / total_tech * 100) if total_tech else 0,
        })

    context.update({
        "organization_data": organization_data,
        "executors": executors,
        "categories": categories,
        "technologies": technologies,
        "date_from": date_from_str,
        "date_to":   date_to_str,
        "all_time":  all_time,
        "global_stats": {
            "total_projects":       projects_qs.count(),
            "under_inspection":     projects_qs.filter(project_status="UNDER_INSPECTION").count(),
            "looking_for_executor": projects_qs.filter(project_status="LOOKING_FOR_EXECUTOR").count(),
            "in_progress":          projects_qs.filter(project_status="IN_PROGRESS").count(),
            "completed":            projects_qs.filter(project_status="COMPLETED").count(),
            "canceled":             projects_qs.filter(project_status="CANCELED").count(),
        },
    })

    return context