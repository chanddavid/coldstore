from asyncio.log import logger
import json
import os
import requests
from django.forms import model_to_dict
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from rest_framework.response import Response
from django.contrib import messages
from  django.contrib.auth.forms import PasswordResetForm
from .decorators import my_login_required
from .serializers import LogInSerializer
from rest_framework.views import APIView
from ..account.hashing import hash_string
from ..account.models import User,Password_reset_request
from ..account.serializers import UserSerializers, PasswordResetRequestSerializer
import datetime
from ..account.models import User_role
from helper.user_has_privilege import user_privilege,user_acc_to_org,user_device
from ..device.models import Device
from ..device.serializers import DeviceSerializer
from rest_framework import status
from logger.log import get_logger
logger=get_logger()
def login_view(request):

    if not request.session.has_key('username'):
        context = {
            'title': 'Login'
        }
        return render(request, 'login.html', context)
    else:
       return redirect('dashboard')

def register_view(request):
    context = {
        'title': 'Register User'
    }
    return render(request, 'register.html', context)

class Check_Username(APIView):
    def post(self, request):
        username = request.POST.get("user_name")

        if not User.objects.filter(user_name=username).exclude().exists():
            return Response(True)
        else:
            return Response(False)

class Check_Email(APIView):
    def post(self, request):
        email = request.POST.get("email")
        if not User.objects.filter(email=email).exists():
            return Response(True)
        else:
            return Response(False)

class Check_Organization(APIView):
    def post(self, request):
        organization = request.POST.get("organization")
        if not User.objects.filter(organization=organization).exists():
            return Response(True)
        else:
            return Response(False)

class Check_Username_For_Update(APIView):
    def post(self, request):
        username = request.POST.get("user_name")
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        if not User.objects.filter(user_name=username).exclude(user_name=user.user_name).exists():
            return Response(True)
        else:
            return Response(False)

class Check_Email_For_Update(APIView):
    def post(self, request):
        email = request.POST.get("email")
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        if not User.objects.filter(email=email).exclude(email=user.email).exists():
            return Response(True)
        else:
            return Response(False)

class Check_Password(APIView):
    def post(self, request):
        print("Data is: ")
        print(request.POST)
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        current_password = request.POST.get('current_password')
        salt = user.salt
        hashed_password = user.hashed_password
        if hash_string(salt, current_password) == hashed_password:
            return Response(True)
        else:
            return Response(False)

def user_doc_info(current_logged_in_user):
    
    total_org=User.objects.all().count()
    total_device=Device.objects.all().count()
    
    current_logged_in_users_with_orgname = User.objects.filter(user_name=current_logged_in_user).values_list('organization', flat=True)     
    data=current_logged_in_users_with_orgname[0]    
    total_dev=Device.objects.filter(organization=data).count()

    return total_org,total_device,total_dev  


class login_validate(APIView):
    def post(self, request):
        user_has_privilege = False
        global user
        data = request.data
        print("Data is: ")
        print(data)
        serializer = LogInSerializer(data=data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            user_serializer = UserSerializers(data={}, instance=user, partial=True)
            if user_serializer.is_valid():
                user_serializer.save(last_login=datetime.datetime.today().date())
            request.session['username']=user.user_name
            current_logged_in_user = request.session.get("username")

            total_org,total_device,total_dev=user_doc_info(current_logged_in_user)
            
            user = User.objects.get(user_name=current_logged_in_user)
            user_has_privilege=user_privilege(user)
            print("Organization value  is: ")            

            context = {
                'user': user,
                'user_has_privilege': user_has_privilege,
                'total_org':total_org,
                'total_device':total_device,
                "total_dev":total_dev,
            
    
            }
            logger.info("successful logged in :%s user" % (user))
            return render(request, 'index.html', context)
        elif serializer.errors:
            print(serializer.errors)
            messages.error(request, serializer.errors["non_field_errors"][0])
            logger.error("Exception caught While connection Database: %s" % serializer.errors["non_field_errors"][0])
            return redirect('login_view')

    @my_login_required
    def get(self, request):
        user_has_privilege = False
        if request.GET.get('page') == None:
            current_logged_in_user = request.session.get("username") 

            total_org,total_device,total_dev=user_doc_info(current_logged_in_user)
            user = User.objects.get(user_name=current_logged_in_user) 
            user_has_privilege=user_privilege(user)
            context = {
                'user': user,
                'user_has_privilege': user_has_privilege,
                'total_org':total_org,
                'total_device':total_device,
                "total_dev":total_dev,

            }
            return render(request, 'index.html', context)
        else:
            print("IN ELSE..")
            # page = request.GET.get('page')
            # print("Get Page num is: ")
            # context = {
            #     'users': total_user_info,
            # }
            # html = render_to_string('static_element/users.html', context)
            # return Response(html)
    def put(self,request):
        print("i am calleing")
        current_logged_in_user = request.session.get("username") 
        # get all the device from datbase of logged in user for chart topic
        user = User.objects.get(user_name=current_logged_in_user) 
        device=user_acc_to_org(user)
        device_serializer = DeviceSerializer(device, many=True)
        all_device=device_serializer.data
        device_list=[{
                "organization": d['organization'],
                "freeze_id": d['freeze_id'] ,
                "device_Name": d['device_Name'] ,
            } for d in all_device
        ]
        print("device_list",device_list)



class logout(APIView):
    def get(self, request):
        try:
            del request.session['username']
        except:
            pass
        return redirect('login_view')

def send_forget_password_notification(notification_message):
    i_hook_url = 'https://ekbana.letsperk.com/hooks/j46ziwsczir4ibk7peaizwamch'
    payload = {
        "channel": "python-report",
        "username": os.environ.get("username"),
        "icon_url": os.environ.get("icon_url"),
        "attachments": [{
            "text": notification_message,

        }],
        "update": {
            "props": {
                "response_type": "in_channel",
                "icon_url": os.environ.get("icon_url"),
                "attachments": [{
                    "message": "this is message :x:"
                }]
            }

        }
    }
    url = i_hook_url
    headers = {'content-type': 'application/json'}
    print("Payload is: ")
    print(payload)
    print("Url is: ")
    print(url)
    print("Headers is: ")
    print(headers)
    x = requests.post(url, data=json.dumps(payload), headers=headers)
    print("Request post text is: ")
    print(x.text)

class Password_reset_requests(APIView):
    def post(self, request):
        data = request.data
        print("Data is: ")
        print(data)
        if User.objects.filter(email=data['email']).exists():
            if not Password_reset_request.objects.filter(email=data['email']).exists():
                user = User.objects.get(email=data['email'])
                serializer = PasswordResetRequestSerializer(data={'user_name':user.user_name, 'email':user.email})
                if serializer.is_valid():
                    print("Yup serialzier is valid...")
                    serializer.save()
                    messages.success(request, 'Request sent to admin')
                    notification_message = f'{user.user_name} has sent a request to reset his/her password.'
                    send_forget_password_notification(notification_message)
                    return redirect('login_view')
                elif serializer.errors:
                    print(serializer.errors)
                print("Data is: ")
                print(data['email'])
            else:
                messages.error(request, 'Request already sent.')
                return redirect('password_reset')
        else:
            messages.error(request, 'User with email doesnot exists.')
            return redirect('password_reset')


    def get(self, request):
        password_reset_form = PasswordResetForm()
        context = {
            'title': 'Password Reset',
            'form': password_reset_form
        }
        return render(request, 'password_reset/password_reset_form.html', context)


class dashboard_chart(APIView):
    def get(self,request):
        current_logged_in_user = request.session.get("username") 
        # get all the device from datbase of logged in user for chart topic
        user = User.objects.get(user_name=current_logged_in_user) 
        device=user_device(user)
        device_serializer = DeviceSerializer(device, many=True)
        all_device=device_serializer.data
        print("dev",all_device[0:2])
        device_list=[{
                "organization": d['organization'],
                "freeze_id": d['freeze_id'] ,
                "device_Name": d['device_Name'] ,
            } for d in all_device
        ]
        return Response(device_list,status=status.HTTP_200_OK)
