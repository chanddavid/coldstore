# Generated by Django 4.0.5 on 2022-09-26 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('id', models.AutoField(editable=False, primary_key=True, serialize=False)),
                ('freeze_id', models.CharField(max_length=50, null=True)),
                ('device_Name', models.CharField(max_length=100, null=True)),
                ('organization', models.CharField(max_length=100, null=True)),
                ('registration_data', models.DateTimeField(auto_now_add=True)),
                ('status', models.BooleanField(default=False, verbose_name='Is Active')),
            ],
            options={
                'db_table': 'device',
            },
        ),
    ]
