from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.signals import pre_social_login
from allauth.account.utils import perform_login
from allauth.utils import get_user_model
from django.http import HttpResponse
from django.dispatch import receiver
from django.shortcuts import redirect
from django.conf import settings
import json

from workspace.models import User


class CustomAccountAdapter(DefaultAccountAdapter):

    def get_login_redirect_url(self, request):
        """
        """
        if request.user.is_authenticated:
            return settings.LOGIN_REDIRECT_URL.format(
                id=request.user.id)
        else:
            return "/"


@receiver(pre_social_login)
def link_to_local_user(sender, request, sociallogin, **kwargs):
    ''' Login and redirect
    This is done in order to tackle the situation where user's email retrieved
    from one provider is different from already existing email in the database
    (e.g facebook and google both use same email-id). Specifically, this is done to
    tackle following issues:
    * https://github.com/pennersr/django-allauth/issues/215

    '''
    email_address = sociallogin.account.extra_data['email']
    users = User.objects.filter(email=email_address)
    if users:
        # allauth.account.app_settings.EmailVerificationMethod
        perform_login(request, users[0], email_verification='optional')
        raise ImmediateHttpResponse(redirect(settings.LOGIN_REDIRECT_URL.format(id=request.user.id)))
