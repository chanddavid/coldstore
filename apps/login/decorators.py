from django.shortcuts import redirect
from django.core import handlers
def my_login_required(function):
    print("Inside wrapper")
    def wrapper(object, *args, **kwargs):
        print("object is: ")
        print(object.request.session.get('username'))
        if not('username' in object.request.session and object.request.session.get('username')):
            return redirect('login_view')
        else:
            return function(object, *args, **kwargs)

    return wrapper