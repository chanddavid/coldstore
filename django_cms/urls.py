"""django_cms URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from apps.login import views as login_view

urlpatterns = [
    path('', include('apps.login.urls')),
    path('dashboard/', login_view.login_validate.as_view(), name="dashboard"),
    path('register/', login_view.register_view, name="register_user_view"),
    path('dashboard/users/', include('apps.account.urls')),
    path('dashboard/roles/', include('apps.roles.urls')),
    path('dashboard/device/', include('apps.device.urls')),
    path('logout/', login_view.logout.as_view(), name="logout"),
    path('password_reset/', login_view.Password_reset_requests.as_view(), name='password_reset'),
    # path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='password_reset/password_reset_done.html'), name='password_reset_done'),
    # path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="password_reset/password_reset_confirm.html"), name='password_reset_confirm'),
    # path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name="password_reset/password_reset_complete.html"), name='password_reset_complete')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

