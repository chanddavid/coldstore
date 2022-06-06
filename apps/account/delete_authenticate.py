from .models import User
from .hashing import hash_string

def deleteAuthenticate(request, password):
    username = request.session['username']
    print("Username is: ")
    print(username)
    try:
        user = User.objects.get(user_name=username)
        salt = user.salt
        hash = user.hashed_password
        if hash_string(salt, password) == hash:
            return user
        else:
            return False
    except User.DoesNotExist as e:
        return False
