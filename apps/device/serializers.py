from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    device_Name = serializers.CharField(
        style={'placeholder': 'Device Name'}
    )
    store=serializers.CharField(
        style={'placeholder': 'Store'}
    )
    data=serializers.FloatField(
        style={'placeholder': 'Data'}
    )  
    
    class Meta:
        model = Device
        fields = "__all__"
