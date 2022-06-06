from django.urls import path
from . import views

urlpatterns = [
    path('', views.roles_page.as_view(), name="roles_page"),
    path('list/', views.roles_view.as_view(), name="list_roles"),
    path('create/', views.roles_view.as_view(), name="create_role"),
    path('edit/<int:id>', views.role_view_detail.as_view(), name="edit_role"),
    path('delete/<int:id>', views.role_view_detail.as_view(), name="delete_role")
]