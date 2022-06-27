from rest_framework import serializers
from .models import Device

class DeviceSerializer(serializers.ModelSerializer):
    device_Name = serializers.CharField(
        style={'placeholder': 'Device Name'}
    )

    organization=serializers.CharField(
        style={'placeholder': 'Organization'}
    )
        
    freeze_id=serializers.CharField(
        style={'placeholder': 'Freeze ID'}
    )  
    
    class Meta:
        model = Device
        fields = "__all__"
