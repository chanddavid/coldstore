
from apps.account.models import User,User_role
from apps.device.models import Device
def user_privilege(user):
    try:          
        current_logged_in_user_role = User_role.objects.select_related('roles').filter(user=user).values_list('roles__name', flat=True)
        if current_logged_in_user_role.exists and current_logged_in_user_role[0].lower() == "organization":
            user_has_privilege = True
    except:
        user_has_privilege = False
    return user_has_privilege


def user_acc_to_org(user):
    try:
        print("inside call function")
        current_logged_in_user = User.objects.filter(user_name=user).values_list('organization', flat=True) 
        print(current_logged_in_user[0].lower())

        print("device organization")
        data=current_logged_in_user[0].lower()
        current_user_device_data=Device.objects.filter(organization=data)
        print(current_user_device_data)
        return current_user_device_data  
    except Exception as e:
        print(e)

    