from django.shortcuts import render
from rest_framework import status
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Device
from .serializers import DeviceSerializer
from ..account.models import User

# Create your views here.
from ..login.decorators import my_login_required


class device_page(APIView):
    """View to render device.html page"""
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'device/device_list.html'
    style = {'template_pack': 'rest_framework/vertical/'}

    @my_login_required
    def get(self, request):
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        serializer = DeviceSerializer()
        return Response({'serializer': serializer, 'style':self.style, 'title': 'Dashboard-Device', 'user':user})



class device_view(APIView):
    def get(self, request):
        device = Device.objects.all()
        device_serializer = DeviceSerializer(device, many=True)
        return Response({"data":device_serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        print("Device data is: ")
        print(data)
        device_serializer = DeviceSerializer(data=data)
        if device_serializer.is_valid():
            device_serializer.save()
            return Response(device_serializer.data, status=status.HTTP_201_CREATED)
        elif device_serializer.errors:
            return Response(device_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class device_view_detail(APIView):
    def get_object(self, id):
        print(id)
        try:
            return Device.objects.get(id=id)
        except Device.DoesNotExist as e:
            return Response({'error': 'Device Does not exist'}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, id):
        instance = self.get_object(id=id)
        device_serializer = DeviceSerializer(instance)
        return Response(device_serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        instance = self.get_object(id=id)
        data = request.data
        print("device update data is: ")
        print(data)
        device_serializer = DeviceSerializer(data=data, instance=instance, partial=True)
        if device_serializer.is_valid():
            device_serializer.save()
            return Response(device_serializer.data, status=status.HTTP_200_OK)
        elif device_serializer.errors:
            print(device_serializer.errors)
            return Response(device_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, id):
        instance = self.get_object(id=id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)