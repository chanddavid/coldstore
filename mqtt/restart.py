import os
import json
from dotenv import load_dotenv
from paho.mqtt import client as mqtt_client

load_dotenv()
MQTT_BROKER = os.getenv("MQTT_BROKER")
MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_PORT = int(os.getenv("MQTT_PORT"))

topic = "esp32/temperature"


def connect_mqtt() -> mqtt_client:
    """this function return the mqtt_client

    Returns:
        mqtt_client: client data 
    """
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client("subscriber_1")
    client.on_connect = on_connect
    client.connect(MQTT_BROKER, MQTT_PORT)
    print(client)
    return client


def subscribe(client: mqtt_client):
    """subscriber subscribed on the topic named esp32/temperature

    Args:
        client (mqtt_client): subscriber_1(is the client that subscribe)
    """
    def on_message(client, userdata, msg):
        print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")

    client.subscribe(topic)
    client.on_message = on_message


def restart(jsondata):
    client = connect_mqtt()
    subscribe(client)
    client.publish("/restart/", json.dumps(jsondata))
    client.loop_forever()


# if __name__ == '__main__':
#     restart()
