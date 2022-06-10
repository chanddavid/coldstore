import paho.mqtt.client as mqtt
import time




def on_message(client,userdata,message):
    print("Received message: ",str(message.payload.decode("utf-8")))


mqttbroker="10.10.5.82"
port=1883
client=mqtt.Client("subscriber_2")
client.connect(mqttbroker,port)



client.subscribe("/restart/")
client.on_message=on_message
client.loop_forever()
