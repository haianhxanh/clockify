import django_filters
from workspace.models import Project


class ProjectFilter(django_filters.FilterSet):
    project_name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")
    task_name = django_filters.CharFilter(field_name="tasks__name", lookup_expr="icontains")

    class Meta:
        model = Project
        # fields = ["name"]
        fields = {
            'id': ['exact'],
            'status': ['exact'],
            'description': ['contains']
        }