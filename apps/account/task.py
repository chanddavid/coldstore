import paho.mqtt.client as mqtt
import pymongo
from asyncio_mqtt.client import Client,MqttError
import json
import asyncio
from datetime import datetime, timedelta
from celery import shared_task
from time import sleep


conn = pymongo.MongoClient('mongodb://localhost:27017')
db = conn.TestingMqtt

@shared_task
async def on_message():
    list = []
    async with Client("10.10.5.82", 1883) as client:
        async with client.filtered_messages('#') as messages:
            await client.subscribe('#')
            async for message in messages:
                print("Message",message.payload.decode())
                Temp = json.loads(message.payload.decode())['temp']
                Organization = json.loads(message.payload.decode())['org']
                Device_ID = json.loads(message.payload.decode())['d_id']
                Freeze_ID = json.loads(message.payload.decode())['f_id']
                print("Info",Temp,Organization,Device_ID,Freeze_ID)
        
                collections = db.list_collection_names()  
                list = []
                if Organization not in collections:
                    db.create_collection(Organization)

                list.append({
                    "metadata": {"device_name": Device_ID, "freeze_id": Freeze_ID, "type": "temperature"},
                    "timestamp": datetime.today().replace(microsecond=0),
                    "temp": Temp,
                })
                db[Organization].insert_many(list)
                # isCrtical = json.loads(message.payload.decode())["critical"]

async def main():
    reconnect_interval = 3 
    while True:
        try:
            await on_message()
        except MqttError as error:
            print(f'Error "{error}". Reconnecting in {reconnect_interval} seconds.')
        finally:
            await asyncio.sleep(reconnect_interval)

