
from http import client
from channels.consumer import AsyncConsumer, SyncConsumer
from channels.exceptions import StopConsumer
from urllib3 import Retry
from mqtt.mqtt_config import MQTTProtocolConfig
import random
from asyncio_mqtt.client import Client
import json
from time import sleep
from mqtt.env_vars import env
from asgiref.sync import sync_to_async
import asyncio
from datetime import datetime, timedelta
import pymongo
import dateutil.parser
from .sendNotifcation import send_notification
conn = pymongo.MongoClient(env.mongodb_localhost)
db = conn.StoreRealTimeData
class SyncDeviceConsumer(SyncConsumer):

    def __init__(self) -> None:
        print("Sync")

        self.mqtt = MQTTProtocolConfig.getInstance()

        self.client = self.mqtt.connect_mqtt("sub_client_ids")
    

    def websocket_connect(self, event):

        print("Connection success")

        self.send({
            "type": "websocket.accept"
        })

        def on_message(client, userdata, msg):
            info = msg.payload.decode()
            # print("Info is: ")
            # print(info)
            
            self.send({
                "type": "websocket.send",
                "text": f"Received `{msg.payload.decode()}` from `{msg.topic}` topic"
            })
        
        self.mqtt.subscribe(self.client, on_message)
        self.client.loop_start()

    def websocket_receive(self, event):
        print("Data received from client") 
    
    # def websocket_disconnect(self, event):
    #     print("Disconnected...")
    #     self.client.loop_stop()
    #     raise StopConsumer()

class AsyncDeviceChartConsumer(AsyncConsumer):

    def __init__(self):
        self.client = None

    async def websocket_connect(self, event):
        print(event)

        print("Connection success")

        await self.send({
            "type": "websocket.accept"
        })
        kwargs = self.scope["url_route"]["kwargs"]
        topic = f"{kwargs['organization']}/{kwargs['freeze_id']}/{kwargs['device_id']}/temperature"
        print("Topic is: ", topic)
        async with Client(env.mqtt_broker,env.mqtt_port) as client:
            self.client = client
            async with client.filtered_messages(topic) as messages:
                await client.subscribe(topic)
                async for message in messages:            
                    print("message are comming")
                    print("Message",message.payload.decode())  
                    try:
                        text=message.payload.decode("utf-8")      
                    except:
                        text=message.payload.decode("unicode_escape")      
                               
                    await self.send({
                        "type": "websocket.send",
                        "text": text
                    })

    async def websocket_receive(self, event):
        print("Data received from client") 

    async def websocket_disconnect(self, event):
        print("websocket Disconnect", event)
        self.client.disconnect()
        raise await StopConsumer()  


def deviceConsumer(kwargs):
    start_date=kwargs['start_date']
    end_date=kwargs['end_date']

    startdate=datetime.strptime(start_date,'%B %d %Y')
    enddate=datetime.strptime(end_date,'%B %d %Y')

    incrementby1day=enddate+timedelta(days=1)  

    date_str=f'{startdate}'
    date_end=f'{enddate}'

    # change
    # y=f'{date_end[0:10]}'+' 23:59:59+00:00'
    # edd=dateutil.parser.parse(y)
    # endchange

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

class selectDateConsumer(SyncConsumer):
    def __init__(self):
        self.client = None

    def websocket_connect(self, event):
        print("Date Connection success")
        self.send({
            "type": "websocket.accept"
        })
        print("scope is",self.scope)
        kwargs = self.scope["url_route"]["kwargs"]
        print("current Time1",datetime.now())
        mylist=deviceConsumer(kwargs)
        print("current Time2",datetime.now())
        # data_set=[d['temp'] for d in mylist]
        # testing start
        data_set=[{
                    "dates": d["timestamp"].strftime("%Y %b %d %H:%M:%S"),
                    "temp": d['temp'] 
                } for d in mylist
            ]
        # testing end

        self.send({
                    "type": "websocket.send",
                    "text":json.dumps({'data_set':data_set}) 
                })

    def websocket_receive(self, event):
        print("Data received from mongo client") 
    
    def websocket_disconnect(self, event):
        print("Disconnecteding from mongo...")
        self.client.disconnect()
        raise StopConsumer()  
class TimeDateConsumer(SyncConsumer):

    def __init__(self):
        self.client = None

    def websocket_connect(self, event):

        print("Date Connection success")

        self.send({
            "type": "websocket.accept"
        })
        print("scope is here:",self.scope)
        kwargs = self.scope["url_route"]["kwargs"]
        time=kwargs['time']
        print("current Time3",datetime.now())
        mylist=deviceConsumer(kwargs)
        print("current Time4",datetime.now())
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
                        # data_set.append(data_set2[i]['temp'])    
                        data_set.append(data_set2[i])    
            
            timeFilter(StrTime)
        self.send({
                    "type": "websocket.send",
                    "text":json.dumps({'data_set':data_set}) 
                })

    def websocket_receive(self, event):
        print("Data received from mongo client") 
    
    def websocket_disconnect(self, event):
        print("Disconnecteding from mongo...")
        self.client.disconnect()
        raise StopConsumer()  

# consumer that save data to databse when adding a device
class AsyncAddDeviceConsumer(AsyncConsumer):
    def __init__(self):
        self.client = None
            
    async def websocket_connect(self, event):
        await self.send({
            "type": "websocket.accept"
        })
        # print(self.scope)
        kwargs = self.scope["url_route"]["kwargs"]
        current_time = datetime.now()
        timebefore1min=current_time-timedelta(minutes=1)
        

        topic = f"{kwargs['organization']}/{kwargs['freeze_id']}/{kwargs['device_id']}/temperature"
    
        print("Topic is: ", topic)

        sendNotificationTime = current_time

        async with Client(env.mqtt_broker,env.mqtt_port) as client:
            self.client = client
            async with client.filtered_messages(topic) as messages:
                await client.subscribe(topic)
                async for message in messages:           
                    cTime = datetime.now()
                    # print("Message",message.payload.decode())
                    Temp=json.loads(message.payload.decode())['temp']
                    Organization=json.loads(message.payload.decode())['org']
                    Device_ID=json.loads(message.payload.decode())['d_id']
                    Freeze_ID=json.loads(message.payload.decode())['f_id']


                    collections = db.list_collection_names()
                    # print(collections)
                    list=[]
                    if Organization not in  collections:
                        db.create_collection(Organization)  
            
                    list.append( {
                            "metadata": {"device_name": Device_ID,"freeze_id":Freeze_ID,"type": "temperature"},
                            "timestamp":datetime.today().replace(microsecond=0),
                            "temp": Temp,
                        })
                    db[Organization].insert_many(list)
                    isCrtical = json.loads(message.payload.decode())["critical"]
 
                    if isCrtical:
                        print("critical Temperature")
                        if cTime.strftime("%d/%m/%Y %H:%M") == sendNotificationTime.strftime("%d/%m/%Y %H:%M"):
                            print("Sending notification after 5 min...")
                            sendNotificationTime = cTime + timedelta(minutes=env.time_interval_to_send_sms)                       
                            print("Is critical after 1 min...")
                            await send_notification(kwargs, message)
                        print("End critical temperature")
               
                    # await asyncio.sleep(1)

    async def websocket_receive(self, event):
        print("Data received from client",event) 
    
    async def websocket_disconnect(self, event):
        print("Disconnecteding...")
        self.client.disconnect()
        raise await StopConsumer()  
