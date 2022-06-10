import os

from mqtt.mqtt_config import MQTTProtocolConfig


def run():
    mqtt = MQTTProtocolConfig.getInstance()
    client = mqtt.connect_mqtt("sub_client_id")
    mqtt.subscribe(client)
    client.loop_forever()

if __name__ == "__main__":
    run()