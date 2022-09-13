from mqtt.env_vars import env
import json
from asgiref.sync import sync_to_async
import requests


async def send_notification(kwargs, message):
    print("Sending notification 1st time....")
    # twilio_client = TwilioSMS.getInstance(env.account_sid, env.auth_token)

    # await sync_to_async(twilio_client.twilio_client.messages.create)(from_=env.twilio_phn_number, to=env.twilio_receiver_phn_number, body=f"Warning: Critical \n \
    #                                                                                                                                                 Organization: {kwargs['organization']} \n \
    #                                                                                                                                                 Freeze: {kwargs['freeze_id']} \n \
    #                                                                                                                                      Temperature  {json.loads(message.payload.decode())['temp']}°C.")

    # r = requests.get(
    #         "http://api.sparrowsms.com/v2/sms/",
    #         params={'token' : env.sparrow_token,
    #               'from'  : env.sparrow_from,
    #               'to'    : env.sparrow_to,
    #               'text'  : f"Warning: Critical \nOrganization: {kwargs['organization']} \nFreeze: {kwargs['freeze_id']} \nTemperature: {json.loads(message.payload.decode())['temp']} degree Celsius."})

    # status_code = r.status_code
    # response = r.text
    # response_json = r.json()
    # print(status_code)
    # print(response)
    # print(response_json)


