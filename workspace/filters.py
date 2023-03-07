import django_filters
from django_filters import OrderingFilter

from workspace.enums import ProjectStatusChoices
from workspace.models import Project


class ProjectFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")
    task_name = django_filters.CharFilter(field_name="tasks__name", lookup_expr="icontains")
    rate = django_filters.RangeFilter(field_name='hourly_rate', lookup_expr='range')
    date = django_filters.DateFromToRangeFilter(field_name="due_date")
    status = django_filters.ChoiceFilter(choices=ProjectStatusChoices)

    o = OrderingFilter(fields=('hourly_rate', 'rate'))

    class Meta:
        model = Project
        fields = {
            'id': ['exact'],
            'status': ['exact'],
            'description': ['contains']
        }
