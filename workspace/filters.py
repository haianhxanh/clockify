import django_filters
from django import forms
from django_filters import OrderingFilter, CharFilter

from workspace.enums import ProjectStatusChoices
from workspace.models import Project, TimeRecord, Task


class LimitFilter(django_filters.Filter):
    field_class = forms.IntegerField

    def __init__(self, *args, **kwargs):
        self.null_value = 5  # move to settings
        super().__init__(*args, **kwargs)

    def filter(self, qs, value):
        if self.null_value != value:
            return qs[:value]
        else:
            return qs[:self.null_value]


class CustomFilterList(django_filters.Filter):
    def filter(self, qs, value):
        if value not in (None, ''):
            values = [v for v in value.split(',')]
            return qs.filter(**{'%s__%s' % (self.name, self.lookup_type): values})
        return qs


class ProjectFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")
    task_name = django_filters.CharFilter(field_name="tasks__name", lookup_expr="icontains")
    rate = django_filters.RangeFilter(field_name='hourly_rate', lookup_expr='range')
    date = django_filters.DateFromToRangeFilter(field_name="due_date")
    status = django_filters.ChoiceFilter(choices=ProjectStatusChoices)
    limit = LimitFilter()
    id = CharFilter(method='multiple_ids')

    o = OrderingFilter(fields=('hourly_rate', 'rate'))

    class Meta:
        model = Project
        fields = {
            'id': ['exact'],
            'status': ['exact'],
            'description': ['contains']
        }

    def multiple_ids(self, queryset, name, value):
        value_list = value.split(',')  # split the values by ,
        return queryset.filter(**{
            name + "__in": value_list,  # add __in to get each value of the list
        })


class TrackingFilter(django_filters.FilterSet):
    limit = LimitFilter()

    class Meta:
        model = TimeRecord
        fields = {
            'id': ['exact'],
            'description': ['contains']
        }


class TaskFilter(django_filters.FilterSet):
    limit = LimitFilter()

    class Meta:
        model = Task
        fields = {
            'id': ['exact'],
            'description': ['contains']
        }
