from mqtt.env_vars import env
from paho.mqtt import client as mqtt_client
import time
from random import randrange


class MQTTProtocolConfig:
    _instance = None

    @staticmethod
    def getInstance():
        """ static access method. """
        if MQTTProtocolConfig._instance == None:
            MQTTProtocolConfig()
        return MQTTProtocolConfig._instance

    def __init__(self):
        """ virtually private constructor. """
        if MQTTProtocolConfig._instance != None:
            raise Exception(" This MQTTProtocolConfig class is a Singleton !")
        else:
            self.broker = env.mqtt_broker
            self.port = env.mqtt_port
            self.username = env.mqtt_user
            self.password = env.mqtt_password
            self.topic = env.mqtt_topic
            # self.client_id = env.mqtt_client_id

            MQTTProtocolConfig._instance = self

    def connect_mqtt(self, client_id):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)

        client = mqtt_client.Client(client_id)
        client.on_connect = on_connect
        client.connect(self.broker, self.port)
        return client

    def publish(self, client):
        while True:
            randNumber = randrange(10)
            client.publish(self.topic, randNumber)
            print(f"just published {randNumber} to the {self.topic} topic")
            time.sleep(2)

    def subscribe(self, client):
        def on_message(client, userdata, message):
            print(f"Received message: {message.payload.decode()} from {self.topic}  topic")
        client.subscribe(self.topic)
        client.on_message = on_message

