from rest_framework import serializers
from .models import User, User_role, Password_reset_request


class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "salt": {'read_only': True},
            "hashed_password": {'read_only': True},
            "last_login": {'read_only': True}
        }

class UserRolesSerializers(serializers.ModelSerializer):

    class Meta:
        model = User_role
        fields = "__all__"

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Password_reset_request
        fields = "__all__"