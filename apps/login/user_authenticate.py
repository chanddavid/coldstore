from django.forms import model_to_dict
from apps.account.hashing import hash_string

from apps.account.models import User

def authenticate(email_username, password):
    try:
        user = User.objects.get(email=email_username)

    except User.DoesNotExist as e:
        try:
            user = User.objects.get(user_name = email_username)
        except User.DoesNotExist as e:
            return False

    salt = user.salt
    hash = user.hashed_password
    if hash_string(salt, password) == hash:
        return user
    else:
        return False