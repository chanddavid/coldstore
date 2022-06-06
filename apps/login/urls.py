from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name="login_view"),
    path('check_username/', views.Check_Username.as_view(), name="check_username"),
    path('check_email/', views.Check_Email.as_view(), name="check_email"),
    path('check_username_update/', views.Check_Username_For_Update.as_view(), name="check_username_update"),
    path('check_email_update/', views.Check_Email_For_Update.as_view(), name="check_email_update"),
    path('check_password/', views.Check_Password.as_view(), name="check_password"),
]