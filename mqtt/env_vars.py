from typing import List
from pydantic import BaseSettings,ValidationError
import json

class EnvVars(BaseSettings):
    #django configuration
    secret_key:str
    debug:bool
    allowed_hosts:List[str]
    session_cookie_name: str

    ##default_configuration
    name:str
    enforce_schema:bool
    host=str

    #mqtt configuration
    mqtt_broker:str
    mqtt_port:int
    mqtt_user:str
    mqtt_password:str
    mqtt_topic:str
    # mqtt_client_id:str

    # twilio configurations
    account_sid: str
    auth_token: str
    twilio_phn_number: str
    twilio_receiver_phn_number: str
    time_interval_to_send_sms: int
    


    #mongodb

    #development
    mongodb_localhost:str
    #production
    # mongodb_production:str


    class Config:
        env_file=".env"
try:
    env=EnvVars()  
    print(env.__dict__)
except ValidationError as e:
    print(e.json())