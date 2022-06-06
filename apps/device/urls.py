from django.urls import path
from . import views

urlpatterns = [
    path('', views.device_page.as_view(), name="device_view"),
    path('list_device/', views.device_view.as_view(), name="list_device"),
    path('create_device/', views.device_view.as_view(), name="create_device"),
    path('update_device/<int:id>', views.device_view_detail.as_view(), name="edit_device"),
    path('delete_device/<int:id>', views.device_view_detail.as_view(), name="delete_device"),


]