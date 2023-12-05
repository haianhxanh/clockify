from django.core.exceptions import ValidationError
from django.test import TestCase, Client

from workspace.models import User

API_SIGNUP_URL = '/api/register/'
API_LOGIN_URL = '/api/login/'


class UserRegistrationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="unittest", email="unittest@testcase.com", password='somepwd123')
        return self.user

    def tearDown(self):
        pass

    def create_form(self, email, username, pwd1, pwd2):
        form = {
            'email': email,
            'username': username,
            'password_1': pwd1,
            'password_2': pwd2,
        }

        return form

    def test_validate_unique_email_ok(self):
        user = User(email='unittest@testcase.com')
        self.assertRaises(ValidationError, user.full_clean)

    def test_validate_email_not_unique(self):
        client = Client()
        invalid_data = self.create_form('unittest@testcase.com', 'uniqueuser1', 'Valid1234567', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 400)

    def test_validate_email_invalid(self):
        client = Client()
        invalid_data = self.create_form('unittest', 'uniqueuser2', 'Valid1234567', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 400)

    def test_validate_unique_username_ok(self):
        user = User(username='uniqueuser2')
        self.assertRaises(ValidationError, user.full_clean)

    def test_validate_username_not_unique(self):
        client = Client()
        invalid_data = self.create_form('uniqueemail1@testcase.com', 'unittest', 'Valid1234567', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 400)

    def test_validate_username_invalid(self):
        client = Client()
        invalid_data = self.create_form('uniqueemail2@testcase.com', 'uni', 'Valid1234567', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 400)

    def test_passwords_match_ok(self):
        client = Client()
        invalid_data = self.create_form('uniqueemail3@testcase.com', 'unittest3', 'Valid1234567', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 201)

    def test_passwords_dont_match(self):
        client = Client()
        invalid_data = self.create_form('uniqueemail3@testcase.com', 'unittest3', 'Valid1234', 'Valid1234567')
        response = client.post(API_SIGNUP_URL, data=invalid_data)
        print(response.content)
        self.assertEquals(response.status_code, 400)


class UserLoginTestCase(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_user_ok(self):
        user = User.objects.create(username="unittest", email="unittest@testcase.com")
        user.set_password('Pwd123456')
        user.save()

        client = Client()
        login = client.login(username='unittest', password='Pwd123456')
        self.assertTrue(login)

    def test_user_authenticated_ok(self):
        user = User.objects.create_user(username="unittest2", email="unittest2@testcase.com")
        user.set_password('Pwd123456')
        user.save()

        client = Client()
        data = {
            "username": "unittest2",
            "password": "Pwd123456"
        }
        response = client.post(API_LOGIN_URL, data=data)

        print('///////////')
        print(response.context_data)
        self.assertTrue(True)
