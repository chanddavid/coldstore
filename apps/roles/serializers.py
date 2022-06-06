from rest_framework import serializers
from .models import Role

class RoleSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        style={'placeholder': 'Name'}
    )
    class Meta:
        model = Role
        fields = "__all__"