from django.db import models
from apps.roles.models import Role
from django.conf import settings
# Create your models here.
class User(models.Model):
    class Meta:
        db_table = "organization"

    organization = models.CharField(max_length=255, blank=False, null=False)
    user_name = models.CharField(max_length=255, unique=True)
    salt = models.CharField(max_length=255)
    hashed_password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    last_login = models.DateField(null=True, blank=True)


    def __str__(self):
        return self.user_name


class User_role(models.Model):
    class Meta:
        db_table = "user_roles"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_id")
    roles = models.ManyToManyField(Role)

class Password_reset_request(models.Model):
    class Meta:
        db_table = "password_reset_request"

    user_name = models.CharField(max_length=255, unique=True)
    email = models.EmailField(max_length=255, blank=True)
    created_at = models.DateField(auto_now=True)



