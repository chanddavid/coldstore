from django.urls import path
from .views import user_page,user_view, user_view_detail, user_role_page, user_roles_view, user_roles_view_detail, deleteConfirmation, register_user, Check_User_Username_For_Update, Check_User_Email_For_Update, Request_reset_page, Request_reset_view


urlpatterns = [
    path('', user_page.as_view(), name="users_page"),
    path('list/', user_view.as_view(), name="list_users"),
    path('create/', user_view.as_view(), name="create_users"),
    path('register_user/', register_user.as_view(), name="register_user"),
    path('edit/<int:id>', user_view_detail.as_view(), name="edit_user"),
    path('delete/<int:id>', user_view_detail.as_view(), name="delete_user"),
    path('deleteConf/', deleteConfirmation.as_view(), name="deleteConf"),
    path('user_role/', user_role_page.as_view(), name="user_role_page"),
    path('user_role/list/', user_roles_view.as_view(), name="list_user_role"),
    path('user_role/create/', user_roles_view.as_view(), name="create_user_roles"),
    path('user_role/edit/<int:id>', user_roles_view_detail.as_view(), name="edit_user_roles"),
    path('user_role/delete/<int:id>', user_roles_view_detail.as_view(), name="delete_user_roles"),
    path('check_user_username_update/', Check_User_Username_For_Update.as_view(), name="check_user_username_update"),
    path('check_user_email_update/', Check_User_Email_For_Update.as_view(), name="check_user_email_update"),
    path('reset_request/', Request_reset_page.as_view(), name="request_reset_page"),
    path('reset_request/list/', Request_reset_view.as_view(), name="request_reset_list_view"),
    path('reset_request/reset/', Request_reset_view.as_view(), name="request_reset_reset_view"),

]