

def send_task_notification(user_id: int):
    from workspace.models import User

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        pass

    print(f"this is user : {user.email}")

