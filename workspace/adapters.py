from pprint import pprint

from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):

    def new_user(self, request):
        pprint(request.__dict__, indent=2)
        raise

