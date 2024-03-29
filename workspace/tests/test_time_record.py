import django.utils.timezone
import struct
from tracemalloc import start
from django.forms import NullBooleanField
from django.test import TestCase
from unittest.mock import patch, Mock
from pprint import pprint
from time import strftime, gmtime, strptime
from workspace.models import TimeRecord, User
import datetime
from time import strftime, gmtime, struct_time
from django.utils import timezone
from workspace.querysets import TimeRecordQuerySet


# Create your tests here.


class TimeRecordTestCase(TestCase):
    def setUp(self):  # runs before every test
        self.user = User.objects.create(username="test")

    def tearDown(self):  # runs after every test
        pass

    def test_end_time_is_datetime_object(self):
        now = datetime.datetime.now()
        date = now.date()
        time_record = TimeRecord.objects.create(user=self.user, start_time=now.time(), date=date)

        end_time = time_record.get_end_time()

        self.assertEqual(type(end_time), datetime.time)

    def test_stop_time_after_midnight(self):
        start_time = strftime("%H:%M")
        self.assertEqual(type(start_time), datetime.time)
        date = datetime.date(2022, 12, 19)
        timer = TimeRecord.objects.create(user=self.user, date=date, start_time=start_time)

        with patch("workspace.models.datetime") as datetime_mock:
            datetime_mock.now = Mock()
            datetime_mock.now.return_value = datetime.datetime(2023, 12, 19)

            timer.stop_time()

        self.assertEqual(timer.end_time, "23:59")
        self.assertEqual(TimeRecord.objects.all().count(), 2)

    # todo test_stop_time_same_day()
    def test_stop_time_same_day(self):
        start_time = strftime("%H:%M")
        now = datetime.datetime.now()
        date = now.date()
        timer = TimeRecord.objects.create(user=self.user, start_time=start_time, date=date)
        timer.stop_time()
        self.assertEqual(timer.date, date)
        self.assertEqual(timer.end_time, strftime("%H:%M"))

    def test_tracked_hours_ok_full_hour(self):
        start_time = datetime.datetime.strptime('12:00:00', "%H:%M:%S")
        end_time = datetime.datetime.strptime('16:00:00', "%H:%M:%S")
        date = datetime.datetime.now().date()
        timer = TimeRecord.objects.create(user=self.user, start_time=start_time, end_time=end_time, date=date)
        tracked_hours = timer.tracked_hours
        self.assertEqual(tracked_hours, 4)

    def test_tracked_hours_ok_half_hour(self):
        start_time = datetime.datetime.strptime('12:30:00', "%H:%M:%S")
        end_time = datetime.datetime.strptime('16:00:00', "%H:%M:%S")
        date = datetime.datetime.now().date()
        timer = TimeRecord.objects.create(user=self.user, start_time=start_time, end_time=end_time, date=date)
        tracked_hours = timer.tracked_hours
        self.assertEqual(tracked_hours, 3.50)

    def test_tracked_hours_past_end_time(self):
        start_time = datetime.datetime.strptime('12:00:00', "%H:%M:%S")
        end_time = datetime.datetime.strptime('10:00:00', "%H:%M:%S")
        date = datetime.datetime.now().date()
        timer = TimeRecord.objects.create(user=self.user, start_time=start_time, end_time=end_time, date=date)
        tracked_hours = timer.tracked_hours
        
        self.assertEqual(tracked_hours, 0)

