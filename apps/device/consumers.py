
from os import PRIO_PGRP
from channels.consumer import AsyncConsumer, SyncConsumer
from channels.exceptions import StopConsumer
from mqtt.mqtt_config import MQTTProtocolConfig
import random
from asyncio_mqtt.client import Client
import json
from time import sleep
from twilio.rest import Client as TwilioClient
from mqtt.env_vars import env
from asgiref.sync import sync_to_async
import asyncio
from datetime import datetime, timedelta
from .twilio_sms import TwilioSMS
import pymongo
from datetime import datetime
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
            print("Info is: ")
            print(info)
            
            self.send({
                "type": "websocket.send",
                "text": f"Received `{msg.payload.decode()}` from `{msg.topic}` topic"
            })
        
        self.mqtt.subscribe(self.client, on_message)
        self.client.loop_start()

    def websocket_receive(self, event):
        print("Data received from client") 
    
    def websocket_disconnect(self, event):
        print("Disconnected...")
        self.client.loop_stop()
        raise StopConsumer()



class AsyncDeviceConsumer(AsyncConsumer):

    # def __init__(self) -> None:
    #     print("Async EXecuting...")
        
    #     self.mqtt = MQTTProtocolConfig.getInstance()

        # self.client = self.mqtt.connect_mqtt("sub_client_ids")

    def __init__(self):
        self.client = None

    async def websocket_connect(self, event):

        print("Connection success")

        await self.send({
            "type": "websocket.accept"
        })

        print("Env sid: ")
        print(env.account_sid)
        print(env.auth_token)

        print("Self.scope is: ")
        print(self.scope)

        kwargs = self.scope["url_route"]["kwargs"]

        topic = f"{kwargs['organization']}/{kwargs['freeze_id']}/{kwargs['device_id']}/temperature"

        
        print("Topic is: ", topic)

        current_time = datetime.now()

        sendNotificationTime = current_time + timedelta(minutes=env.time_interval_to_send_sms)

        async with Client("10.10.5.82") as client:
            self.client = client
            async with client.filtered_messages(topic) as messages:
                await client.subscribe(topic)
                async for message in messages:            
                    print(message)    
                    cTime = datetime.now()
                    
                    print("CTime:", cTime.strftime("%d/%m/%Y %H:%M"))

                    # print("Notification time: ", sendNotificationTime.strftime("%d/%m/%Y %H:%M"))
                    print("message are comming")
                    print("Message",message.payload.decode())
                    Temp=json.loads(message.payload.decode())['temp']
                    Organization=json.loads(message.payload.decode())['org']
                    Device_ID=json.loads(message.payload.decode())['d_id']
                    Freeze_ID=json.loads(message.payload.decode())['f_id']

                    collections = db.list_collection_names()
                    print(collections)
                    list=[]
                    if Organization not in  collections:
                        print("False")
                        db.create_collection(Organization, timeseries={
                                'timeField': "timestamp",
                                'metaField': "metadata",
                                'granularity': "seconds"
                            })  
                    print("True") 
            
                    list.append( {
                            "metadata": {"device_name": Device_ID,"freeze_id":Freeze_ID,"type": "temperature"},
                            "timestamp":datetime.today().replace(microsecond=0),
                            "temp": Temp
                        })
                    db[Organization].insert_many(list)
                    print("collections",collections)
                    

                    isCrtical = json.loads(message.payload.decode())["critical"]
    
                    if cTime.strftime("%d/%m/%Y %H:%M") == sendNotificationTime.strftime("%d/%m/%Y %H:%M"):
                        print("Sending notification...")
                        sendNotificationTime = cTime + timedelta(minutes=env.time_interval_to_send_sms)

                        if isCrtical:
                            print("Is critical...")
                            twilio_client = TwilioSMS.getInstance(env.account_sid, env.auth_token)
                            print(twilio_client)
                        
                            await sync_to_async(twilio_client.twilio_client.messages.create)(from_=env.twilio_phn_number, to=env.twilio_receiver_phn_number, body=f"Warning: Critical \n \
                                                                                                                                                    Organization: {kwargs['organization']} \n \
                                                                                                                                                    Freeze: {kwargs['freeze_id']} \n \
                                                                                                                                         Temperature  {json.loads(message.payload.decode())['temp']}°C.")
                    await self.send({
                        "type": "websocket.send",
                        "text": message.payload.decode()
                    })
               
                    # await asyncio.sleep(1)



    async def websocket_receive(self, event):
        print("Data received from client") 
    
    async def websocket_disconnect(self, event):
        print("Disconnecteding...")
        self.client.disconnect()
        raise await StopConsumer()  

        