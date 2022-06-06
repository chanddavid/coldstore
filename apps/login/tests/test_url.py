from django.urls import reverse, resolve
import pytest

class TestLoginUrls:

    @pytest.mark.parametrize("url_name",
        [("login_view"),
         ("check_username"),
         ("check_email"),
         ("check_email_update"),
         ("check_password"),
         ("search_user")]
    )
    def test_login_view_url(self, url_name):
        path = reverse(url_name)
        assert resolve(path).url_name == url_name
        assert resolve(path).view_name == url_name

    # def test_check_username_url(self):
    #     path = reverse('check_username')
    #     assert resolve(path).url_name == 'check_username'
    #     assert resolve(path).view_name == 'check_username'
    #
    # def test_check_email_url(self):
    #     path = reverse('check_email')
    #     assert resolve(path).url_name == 'check_email'
    #     assert resolve(path).view_name == 'check_email'
    #
    # def test_check_username_update_url(self):
    #     path = reverse('check_email_update')
    #     assert resolve(path).url_name == 'check_email_update'
    #     assert resolve(path).view_name == 'check_email_update'
    #
    # def test_check_password(self):
    #     path = reverse('check_password')
    #     assert resolve(path).url_name == 'check_password'
    #     assert resolve(path).view_name == 'check_password'
    #
    # def test_search_user(self):
    #     path = reverse('search_user')
    #     assert resolve(path).url_name == 'search_user'
    #     assert resolve(path).view_name == 'search_user'


