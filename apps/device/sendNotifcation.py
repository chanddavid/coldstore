from .twilio_sms import TwilioSMS
from mqtt.env_vars import env
import json
from asgiref.sync import sync_to_async

async def send_notification(kwargs, message):
    print("Sending notification 1st time....")
    twilio_client = TwilioSMS.getInstance(env.account_sid, env.auth_token)

    await sync_to_async(twilio_client.twilio_client.messages.create)(from_=env.twilio_phn_number, to=env.twilio_receiver_phn_number, body=f"Warning: Critical \n \
                                                                                                                                                    Organization: {kwargs['organization']} \n \
                                                                                                                                                    Freeze: {kwargs['freeze_id']} \n \
                                                                                                                                         Temperature  {json.loads(message.payload.decode())['temp']}°C.")