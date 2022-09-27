from typing import List
from pydantic import BaseSettings,ValidationError
import json

class EnvVars(BaseSettings):
    #django configuration
    secret_key:str
    debug:bool
    allowed_hosts:List[str]
    session_cookie_name: str


    #mqtt configuration
    mqtt_broker:str
    mqtt_port:int


    #mongodb
    mongodb_localhost:str
    name:str
    enforce_schema:bool

    # sparrow
    time_interval_to_send_sms:int
    sparrow_token:str
    sparrow_from:str
    sparrow_to:str

    class Config:
        env_file=".env"
try:
    env=EnvVars()  
    print(env.__dict__)
except ValidationError as e:
    print(e.json())