import json

from django.contrib import messages
from django.forms import model_to_dict
from django.shortcuts import render, redirect
from rest_framework.response import Response
from .delete_authenticate import deleteAuthenticate
from rest_framework import status
from rest_framework.views import APIView
from .forms import UserForm, UserRolesForm, UserUpdateForm
from .models import User, User_role, Password_reset_request
from .serializers import UserSerializers, UserRolesSerializers, PasswordResetRequestSerializer
from .hashing import get_salt, hash_string
from ..login.decorators import my_login_required
from apps.roles.models import Role
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from helper.user_has_privilege import user_privilege
from env_vars import env
from logger.log import get_logger
logger=get_logger()
# Create your views here.




edit_user = None


class user_page(APIView):
    """View to render user.html page"""
    @my_login_required
    def get(self, request):
        user_has_privilege = False
        form = UserForm()

        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user) 
        user_has_privilege=user_privilege(user)
                
        context = {
            'form': form,
            'title': "Dashboard - User",
            'user': user,
            'user_has_privilege': user_has_privilege
        }
        return render(request, 'user/users.html', context)


class user_view(APIView):
    """APIView of the user..."""
    def get(self, request):
        """Get request to list all the users..."""
        print("getting user view")
        users = User.objects.all()
        user_serializer = UserSerializers(users, many=True)
        return Response({"data": user_serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        """Post request to create new users..."""
        print("posting......")
        data = request.data
        print("data is......")
        print(data)
        salt = get_salt()
        hashed_password = hash_string(salt, data["password"])
        serializer = UserSerializers(data=data)
        if serializer.is_valid():
            serializer.save(salt=salt, hashed_password=hashed_password)
            print(serializer.data)
            logger.info("successfully register user:%s by user:%s"% (serializer.data['user_name'],request.session.get("username")))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif serializer.errors:
            print(serializer.errors)
            logger.error("Exception caught While connection Database: %s" % serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class register_user(APIView):
    def post(self, request):
        data = request.data
        print("Data is: ")
        print(data)
        salt = get_salt()
        hashed_password = hash_string(salt, data["password"])
        data = {'user_name': request.data['user_name'], 'email':request.data['email'], 'password': request.data['password'], 'confirm_password':request.data['confirm_password'], 'organization':request.data['organization'], 'phone_number': request.data['phone_number']}
        serializer = UserSerializers(data=data)
        if serializer.is_valid():
            serializer.save(salt=salt, hashed_password=hashed_password, is_active=False)
            username = serializer.validated_data['user_name']
            messages.success(request, f'{username} created')
            logger.info("successfully register :%s user" % (username))
            return redirect('login_view')
        elif serializer.errors:
            print(serializer.errors)
            logger.error("Exception caught While connection Database: %s" % serializer.errors)
            return redirect('register_user')    

class user_view_detail(APIView):
    """User APIView to retrieve specific user"""
    def get_object(self, id):
        """Returns user of specific id...."""
        try:
            return User.objects.get(id=id)
        except User.DoesNotExist as e:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)


    def get(self, request, id):
        """Get request to retrieve user of specific user id..."""
        global edit_user
        print("getting specific.....")

        instance = self.get_object(id=id)
        print(model_to_dict(instance))
        edit_user = instance
        serializer = UserSerializers(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        """Put request to update the user of specific id...."""
        instance = self.get_object(id=id)
        data = request.data
        print("instance is: ")
        print(model_to_dict(instance))
        print("data is: ")
        print(data)
        serializer = UserSerializers(data=data, instance=instance, partial=True)
        if serializer.is_valid():
            print("Valid......")
            serializer.save()
            logger.info("successfully edited user:%s by user:%s" % (serializer.data['user_name'],request.session.get("username")))
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif serializer.errors:
            print("Errors.....")
            logger.error("Exception caught While connection Database: %s" % serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

     
    def delete(self, request, id):
        """Delete request to remove the user of specific id..."""
        print("deleting....")
        instance = self.get_object(id=id)
        instance.delete()
        logger.info("successfully deleted user:%s by user:%s" % (instance,request.session.get("username")))
        return Response(status=status.HTTP_204_NO_CONTENT)

class Check_User_Username_For_Update(APIView):
    def post(self, request):
        instance_user = model_to_dict(edit_user)
        username = request.POST.get("user_name")
        if not User.objects.filter(user_name=username).exclude(user_name=instance_user['user_name']).exists():
            return Response(True)
        else:
            return Response(False)

class Check_User_Email_For_Update(APIView):
    def post(self, request):
        instance_user = model_to_dict(edit_user)
        email = request.POST.get("email")
        if not User.objects.filter(email=email).exclude(email=instance_user['email']).exists():
            return Response(True)
        else:
            return Response(False)

class deleteConfirmation(APIView):
    def post(self, request):
        print("Password is: ")
        print(request.data)
        password = request.data['password']
        user = deleteAuthenticate(request, password)
        print(user)
        if user:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)



# def deleteConfirmation(request, password):
#     user = request.session['username']
#     user_model = User.objects.get(user_name = user)
#     salt = user_model.salt
#
#     print(user)
#     print(user_model)
#     print("password is: ")
#     print(password)


class user_role_page(APIView):
    @my_login_required
    def get(self, request):
        user_has_privilege = False
        form = UserRolesForm()
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        
        user_has_privilege=user_privilege(user)
        context = {
            "form": form,
            "title": "Dashboard - UserRoles",
            "user": user,
            'user_has_privilege': user_has_privilege
        }
        return render(request, 'user_role/user_roles.html', context)

class user_roles_view(APIView):
    def get(self, request):
        user_role = User_role.objects.all()
        serializer = UserRolesSerializers(user_role, many=True)
        list_data = []
        for data in serializer.data:
            user_model = User.objects.get(id=data["user"])
            role = []
            for role_id in data["roles"]:
                role_model = Role.objects.get(id=role_id)
                role.append(role_model.name)
            data = {
                "id": data["id"],
                "user": user_model.user_name,
                "roles": role
            }
            list_data.append(data)

        return Response({"data": list_data}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        serializer = UserRolesSerializers(data={'user': data["user"], 'roles': request.data.getlist("roles[]")})
        if serializer.is_valid():
            serializer.save()
            user = serializer.validated_data["user"]
            roles = [role_name.name for role_name in serializer.validated_data["roles"]]
            print(user.user_name)
            print(roles)
            data = {
                "id": serializer.data["id"],
                "user": user.user_name,
                "roles": roles
            }
            return Response(data, status=status.HTTP_201_CREATED)
        elif serializer.errors:
            print("Errors...")
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class user_roles_view_detail(APIView):
    def get_object(self, id):
        try:
            return User_role.objects.get(id=id)
        except User_role.DoesNotExist as e:
            return Response({'error': 'User roles does exists...'})

    def get(self, request, id):
        instance = self.get_object(id)
        serializer = UserRolesSerializers(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        instance = self.get_object(id)
        data = request.data
        print(model_to_dict(instance))
        print(data)
        serializer = UserRolesSerializers(data={'user': data['user'], 'roles': data.getlist('roles[]')}, instance=instance, partial=True)
        if serializer.is_valid():
            print("Valid....")
            print(serializer.validated_data)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif serializer.errors:
            print("Errors...")
            print(serializer.errors)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, id):
        print("deleting....")
        instance = self.get_object(id)
        print(instance)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class Request_reset_page(APIView):
    def get(self, request):
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        user_has_privilege=user_privilege(user)     
        context = {
            'title': 'Reset Request',
            'user': user,
            'user_has_privilege':user_has_privilege
        }
        return render(request, 'password_reset/reset_request.html', context)

class Request_reset_view(APIView):
    def get(self, request):
        request_reset = Password_reset_request.objects.all()
        request_reset_serializer = PasswordResetRequestSerializer(request_reset, many=True)
        print("Request data is: ")
        print(request_reset_serializer.data)
        print(type(request_reset_serializer.data))
        return Response({'data':request_reset_serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        user_instance = User.objects.get(email=data['email'])
        reset_password_instance = Password_reset_request.objects.get(email=data['email'])
        print("User instance is: ")
        print(user_instance)
        password = data['password']

        salt = get_salt()
        hashed_password = hash_string(salt, password)
        user_serialzier = UserSerializers(data={}, instance=user_instance, partial=True)
        if user_serialzier.is_valid():
            print("Yes it is valid.....")
            user_serialzier.save(salt=salt, hashed_password=hashed_password)
            reset_password_instance.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
        elif user_serialzier.errors:
            print(user_serialzier.errors)
