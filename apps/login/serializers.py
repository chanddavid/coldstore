from .user_authenticate import authenticate
from rest_framework import serializers, exceptions


class LogInSerializer(serializers.Serializer):
    email_username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        print("attrs are: ")
        print(attrs)
        email_username = attrs.get("email_username", "")
        password = attrs.get("password", "")

        if email_username and password:
            user = authenticate(email_username=email_username, password=password)
            if user:
                print(user)
                if user.is_active:
                    attrs["user"] = user
                else:
                    msg = "User is not active!"
                    raise exceptions.ValidationError(msg)
            else:
                msg = "Username and password doesnot match!"
                raise exceptions.ValidationError(msg)
        else:
            msg = "Enter username and password"
            raise exceptions.ValidationError(msg)
        return attrs
