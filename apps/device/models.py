from django.db import models
from apps.account.models import User
# Create your models here.


class Device(models.Model):

    class Meta:
        db_table = "device"
    # user=models.ForeignKey(User,on_delete=models.CASCADE)
    id = models.AutoField(primary_key=True, editable=False)
    freeze_id=models.CharField(max_length=50,null=True)
    device_Name=models.CharField(max_length=100,null=True)
    organization=models.CharField(max_length=100,null=True)
    registration_data=models.DateTimeField(auto_now_add=True)
    status=models.BooleanField("Is Active",default=False)
    

    def __str__(self):
        return self.device_Name
