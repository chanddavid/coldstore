from django.db import models
import uuid
# Create your models here.


class Device(models.Model):

    class Meta:
        db_table = "device"
    id = models.AutoField(primary_key=True, editable=False)
    device_Name=models.CharField(max_length=100,unique=True,null=True)
    store=models.CharField(max_length=100,null=True)
    data=models.FloatField()
    status=models.BooleanField("Is Active",default=False)

    def __str__(self):
        return self.device_Name
