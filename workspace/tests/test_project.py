from unittest import TestCase
from django.utils.crypto import get_random_string
from workspace.models import TimeRecord, User
from workspace.models import Project, Task, TimeRecord


class ProjectTestCase(TestCase):

    def create_user(self):
        self.user = User.objects.create(username=get_random_string(length=4))
        return self.user

    def create_data(self, name='test_project', status='IN_PROGRESS'):
        user = self.create_user()
        project = Project.objects.create(name=name, status=status, user=user)
        task_01 = Task.objects.create(name='task_01', project=project)
        task_02 = Task.objects.create(name='task_02', project=project)
        return {'project': project, 'tasks': [task_01, task_02], 'user': user}

    def create_tracking(self, start_time, end_time, date, user, task):
        tracking = TimeRecord.objects.create(start_time=start_time, end_time=end_time, date=date,
                                             task=task, user=user)
        return tracking

    def test_tracked_hours_ok(self):
        data = self.create_data()
        user = data['user']
        project = data['project']
        task_01 = data['tasks'][0]
        task_02 = data['tasks'][1]
        tracking_01 = self.create_tracking(start_time="12:00:00", end_time="15:00:00", date="2023-01-02",
                                           task=task_01, user=user)
        tracking_02 = self.create_tracking(start_time="10:00:00", end_time="13:30:00", date="2023-01-02",
                                           task=task_01, user=user)
        tracking_03 = self.create_tracking(start_time="07:30:00", end_time="10:30:00", date="2023-01-02",
                                           task=task_02, user=user)
        timer = project.tracked_hours
        self.assertEqual(timer, 9.5)

    def test_total_allocated_hours_ok(self):
        data = self.create_data()
        user = data['user']
        project = data['project']
        task_01 = data['tasks'][0]
        task_02 = data['tasks'][1]
        task_01.max_allocated_hours = 12.5
        task_02.max_allocated_hours = 9
        task_01.save()
        task_02.save()

        allocated_hours = project.total_allocated_hours

        self.assertEqual(allocated_hours, 21.5)

    def test_total_allocated_hours_negative_ok(self):
        data = self.create_data()
        user = data['user']
        project = data['project']
        task_01 = data['tasks'][0]
        task_02 = data['tasks'][1]
        task_01.max_allocated_hours = 12.5
        task_02.max_allocated_hours = -9
        task_01.save()
        task_02.save()

        allocated_hours = project.total_allocated_hours

        self.assertEqual(allocated_hours, 12.5)
