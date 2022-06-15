
from channels.consumer import AsyncConsumer, SyncConsumer
from channels.exceptions import StopConsumer
from mqtt.mqtt_config import MQTTProtocolConfig
import random
from asyncio_mqtt.client import Client
import json

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


        async with Client("10.10.5.82") as client:
            self.client = client
            async with client.filtered_messages("esp32/temperature") as messages:
                await client.subscribe("esp32/temperature")
                async for message in messages:
                     print("Message is: ")
                     print(message)
                     await self.send({
                        "type": "websocket.send",
                        "text": message.payload.decode()
                    })

    async def websocket_receive(self, event):
        print("Data received from client") 
    
    async def websocket_disconnect(self, event):
        print("Disconnecteding...")
        self.client.disconnect()
        raise await StopConsumer()