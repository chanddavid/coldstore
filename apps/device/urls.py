from django.urls import path
from . import views

urlpatterns = [
    path('', views.device_page.as_view(), name="device_view"),
    path('list_device/', views.device_view.as_view(), name="list_device"),
    path('create_device/', views.device_view.as_view(), name="create_device"),
    path('update_device/<int:id>', views.device_view_detail.as_view(), name="edit_device"),
    path('delete_device/<int:id>', views.device_view_detail.as_view(), name="delete_device"),
    # path('mqtt_device_restart/', views.mqtt_device_restart.as_view(), name="mqtt_device_restart"),


]




# current_logged_in_user = request.session.get("username")
# cureent_user_orgvalue = User.objects.filter(user_name=current_logged_in_user).values_list('organization', flat=True) 
# print("current user org value",cureent_user_orgvalue[0])


#    organization = serializers.SerializerMethodField('_is_my_find')

#     def _is_my_find(self, obj):
#         print("device",obj)
#         organization = self.context.get("organization")
#         return organization