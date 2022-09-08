from . import consumers
from django.urls import path

websocket_urlpatterns = [
    path('ws/get-real-time-data/', consumers.SyncDeviceConsumer.as_asgi()),
    path('ws/async-get-real-time-data/<str:organization>/<str:freeze_id>/<str:device_id>', consumers.AsyncDeviceChartConsumer.as_asgi()),
    path('ws/async-save-data-database/<str:organization>/<str:freeze_id>/<str:device_id>', consumers.AsyncAddDeviceConsumer.as_asgi()),
    path('ws/async-search-date/<str:organization>/<str:freeze_id>/<str:start_date>/<str:end_date>', consumers.selectDateConsumer.as_asgi()),
    path('ws/async-search-date/<str:organization>/<str:freeze_id>/<str:start_date>/<str:end_date>/<str:time>', consumers.TimeDateConsumer.as_asgi()),
]