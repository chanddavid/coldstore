from django.shortcuts import render
from rest_framework import status
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Role
from .serializers import RoleSerializer
from ..account.models import User

# Create your views here.
from ..login.decorators import my_login_required


class roles_page(APIView):
    """View to render roles.html page"""
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'roles/roles.html'
    style = {'template_pack': 'rest_framework/vertical/'}
    @my_login_required
    def get(self, request):
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        serializer = RoleSerializer()
        return Response({'serializer': serializer, 'style':self.style, 'title': 'Dashboard-Role', 'user':user})


class roles_view(APIView):
    def get(self, request):
        roles = Role.objects.all()
        roles_serializer = RoleSerializer(roles, many=True)
        return Response({"data":roles_serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        print("Role data is: ")
        print(data)
        roles_serializer = RoleSerializer(data=data)
        if roles_serializer.is_valid():
            roles_serializer.save()
            return Response(roles_serializer.data, status=status.HTTP_201_CREATED)
        elif roles_serializer.errors:
            return Response(roles_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class role_view_detail(APIView):
    def get_object(self, id):
        try:
            return Role.objects.get(id=id)
        except Role.DoesNotExist as e:
            return Response({'error': 'Role Does not exist'}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, id):
        instance = self.get_object(id=id)
        role_serializer = RoleSerializer(instance)
        return Response(role_serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        instance = self.get_object(id=id)
        data = request.data
        print("Role update data is: ")
        print(data)
        role_serializer = RoleSerializer(data=data, instance=instance, partial=True)
        if role_serializer.is_valid():
            role_serializer.save()
            return Response(role_serializer.data, status=status.HTTP_200_OK)
        elif role_serializer.errors:
            print(role_serializer.errors)
            return Response(role_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, id):
        instance = self.get_object(id=id)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)