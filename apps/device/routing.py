from . import consumers
from django.urls import path

websocket_urlpatterns = [
    path('ws/get-real-time-data/', consumers.SyncDeviceConsumer.as_asgi()),
    path('ws/async-get-real-time-data/', consumers.AsyncDeviceConsumer.as_asgi()),
]