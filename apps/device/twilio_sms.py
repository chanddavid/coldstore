from twilio.rest import Client as TwilioClient
from mqtt.env_vars import env

class TwilioSMS:

    __instance = None

    @staticmethod
    def getInstance(account_sid, auth_token):
        
        if TwilioSMS.__instance is None:
            TwilioSMS(account_sid, auth_token)

        return TwilioSMS.__instance

    def __init__(self, account_sid, auth_token) -> None:
        if TwilioSMS.__instance is not None:
            raise Exception("Twilio SMS class is a singleton...")
        else:
            self.twilio_client = TwilioClient(account_sid, auth_token)
            TwilioSMS.__instance = self