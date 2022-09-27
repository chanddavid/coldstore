from unittest import result
from urllib import request
from django.shortcuts import render
from rest_framework import status
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Device
from .serializers import DeviceSerializer
from ..account.models import User
from apps.account.models import User_role
# Create your views here.
from ..login.decorators import my_login_required
from helper.user_has_privilege import user_privilege
from helper.user_has_privilege import user_acc_to_org
# second chart connection with database
from datetime import datetime, timedelta
import dateutil.parser
from env_vars import env
from logger.log import get_logger
logger=get_logger()
import pymongo
conn = pymongo.MongoClient(env.mongodb_localhost)
db = conn.TestingMqtt


# from mqtt.restart import restart
from env_vars import env
import pymongo

# mongodb dataset
# def getdataset(current_logged_in_user):
#         conn = pymongo.MongoClient(env.mongodb_localhost)
#         db = conn.StoreRealTimeData
#         current_logged_in_users_with_orgname = User.objects.filter(user_name=current_logged_in_user).values_list('organization', flat=True)     
#         datas=current_logged_in_users_with_orgname[0] 
#         collection=db[datas]
#         cursor = collection.find()
#         return cursor
class device_page(APIView):
    """View to render device.html page"""
    renderer_classes = [TemplateHTMLRenderer]
    template_name = 'device/device_list.html'
    style = {'template_pack': 'rest_framework/vertical/'}

    @my_login_required
    def get(self, request):
        user_has_privilege = False
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        serializer = DeviceSerializer()
        user_has_privilege=user_privilege(user)
  
        return Response({'serializer': serializer, 'style':self.style, 'title': 'Dashboard-Device', 'user':user,'user_has_privilege': user_has_privilege})



class device_view(APIView):
    def get(self, request):
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)

        if user_privilege(user):
            device = Device.objects.all()
        else:           
            device=user_acc_to_org(user)
        device_serializer = DeviceSerializer(device, many=True)
        return Response({"data":device_serializer.data}, status=status.HTTP_200_OK)


    def post(self, request):
        current_logged_in_user = request.session.get("username")
        user = User.objects.get(user_name=current_logged_in_user)
        data = request.data 
        print('data',data)
        if not user_privilege(user):
            current_logged_in_user = request.session.get("username")
            cureent_user_orgvalue = User.objects.filter(user_name=current_logged_in_user).values_list('organization', flat=True) 
            print("current user org value",cureent_user_orgvalue[0])
            data = {'freeze_id': request.data['freeze_id'], 'device_Name':request.data['device_Name'],'organization':cureent_user_orgvalue[0],'status':request.data['status']}
            device_serializer = DeviceSerializer(data=data)
        else:
            device_serializer = DeviceSerializer(data=data)
            
        
        if device_serializer.is_valid():
            device_serializer.save()
            logger.info("successfully Created:%s device by user:%s"% (request.data['device_Name'],request.session.get("username")))
            return Response(device_serializer.data, status=status.HTTP_201_CREATED)
        elif device_serializer.errors:
            logger.error("Exception caught : %s" % device_serializer.errors)
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
            logger.info("successfully Edited:%s device by user:%s"% (request.data['device_Name'],request.session.get("username")))
            return Response(device_serializer.data, status=status.HTTP_200_OK)
        elif device_serializer.errors:
            print(device_serializer.errors)
            logger.error("Exception caught : %s" % device_serializer.errors)
            return Response(device_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, id):
        instance = self.get_object(id=id)
        instance.delete()
        logger.info("successfully Deleted:%s device by user:%s"% (instance,request.session.get("username")))
        return Response(status=status.HTTP_204_NO_CONTENT)



class getData_Backed(APIView):
    def deviceConsumer(self,kwargs):
        start_date=kwargs['start_date']
        end_date=kwargs['end_date']
        startdate=datetime.strptime(start_date,'%B %d %Y')
        enddate=datetime.strptime(end_date,'%B %d %Y')

        incrementby1day=enddate+timedelta(days=1)  

        date_str=f'{startdate}'
        date_end=f'{enddate}'

        final_start_date = dateutil.parser.parse(date_str)
        final_end_date = dateutil.parser.parse(date_end) 
        print("type2",final_start_date,final_end_date)  
        collection=db[kwargs['organization']] 

        if final_start_date==final_end_date:     
            cursor = collection.find({'timestamp':{'$gte':datetime.strptime(start_date,'%B %d %Y'),'$lt':incrementby1day},"metadata.freeze_id":kwargs['freeze_id']})   
        else:
            cursor = collection.find({'timestamp':{'$gte':datetime.strptime(start_date,'%B %d %Y'),'$lte':incrementby1day},"metadata.freeze_id":kwargs['freeze_id']})
        print("cursor",cursor)
        mylist=[]
        

        for i in cursor:
            mylist.append(i)
        return mylist

    def post(self,request):
        data =request.data
        mylist=self.deviceConsumer(data)
        data_set=[{
                    "dates": d["timestamp"].strftime("%Y %b %d %H:%M:%S"),
                    "temp": d['temp'] 
                } for d in mylist
            ]
        result={'data_set':data_set}
        return Response(result,status=status.HTTP_200_OK)


class getData_Backed_time(APIView):
    def deviceConsumerTime(self,kwargs):
        start_date=kwargs['start_date']
        end_date=kwargs['end_date']
        startdate=datetime.strptime(start_date,'%B %d %Y')
        enddate=datetime.strptime(end_date,'%B %d %Y')

        incrementby1day=enddate+timedelta(days=1)  

        date_str=f'{startdate}'
        date_end=f'{enddate}'

        final_start_date = dateutil.parser.parse(date_str)
        final_end_date = dateutil.parser.parse(date_end) 
        print("type2",final_start_date,final_end_date)  
        collection=db[kwargs['organization']] 

        if final_start_date==final_end_date:     
            cursor = collection.find({'timestamp':{'$gte':datetime.strptime(start_date,'%B %d %Y'),'$lt':incrementby1day},"metadata.freeze_id":kwargs['freeze_id']})   
        else:
            cursor = collection.find({'timestamp':{'$gte':datetime.strptime(start_date,'%B %d %Y'),'$lte':incrementby1day},"metadata.freeze_id":kwargs['freeze_id']})
        print("cursor",cursor)
        mylist=[]
        

        for i in cursor:
            mylist.append(i)
        return mylist

    def post(self,request):
        data =request.data
        time=data['time']
        mylist=self.deviceConsumerTime(data)
        if len(mylist)==0:
            data_set=[]
        else:
            lastTime=mylist[-1]['timestamp']

            if time=='halfhr':
                subTime = lastTime-timedelta(minutes=30)  
            else:
                subTime = lastTime-timedelta(hours=1)
            StrTime=f'{subTime}'      
            data_set2=[{
                    "time": d["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
                    "temp": d['temp'] 
                } for d in mylist
            ]
            data_set=[]
            def timeFilter(tym):
                for i in range(len(data_set2)): 
                    if data_set2[i]["time"] >= tym:
                        data_set.append(data_set2[i])    
            
            timeFilter(StrTime)
            result={'data_set':data_set}
        return Response(result,status=status.HTTP_200_OK)



# class mqtt_device_restart(APIView):
#     def post(self,request):
#         json=dict(request.data)
#         restart(json)
#         print("Loop after run")
#         return Response({"message":"success"}, status=status.HTTP_200_OK)

