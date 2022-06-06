from PIL import Image
from django import forms
from .models import User, User_role
from apps.roles.models import Role

# TEAM_CHOICES = (
#     ('', 'Select a team'),
#     ("Big Data", "Big Data"),
#     ("Python", "Python"),
#     ("NLP", "NLP"),
#     ("CV", "CV"),
#     ("ML", "ML"),
#     ("IOT", "IOT")
# )

class UserForm(forms.ModelForm):
    organization = forms.CharField(widget=forms.TextInput(attrs={'class':'form-control'}))
    is_superuser = forms.BooleanField(initial=False,
                                      widget=forms.RadioSelect(choices=[(True, 'Yes'),
                                                            (False, 'No')],
                                         ))

    is_active = forms.BooleanField(initial=False,
                                      widget=forms.RadioSelect(choices=[(True, 'Yes'),
                                                                        (False, 'No')],
                                                               ))
    class Meta:
        model = User
        fields = "__all__"


class UserRolesForm(forms.ModelForm):
    roles = forms.ModelMultipleChoiceField(
        queryset=Role.objects,
        widget=forms.SelectMultiple,
        required=True)
    class Meta:
        model = User_role
        fields = "__all__"

class UserUpdateForm(forms.ModelForm):
    current_password = forms.CharField(required=False, widget=forms.PasswordInput)
    new_password = forms.CharField(required=False, widget=forms.PasswordInput, disabled=True)
    confirm_newpassword = forms.CharField(required=False, widget=forms.PasswordInput, disabled=True)

    class Meta:
        model = User
        fields = ['user_name', 'first_name', 'last_name', 'email']

