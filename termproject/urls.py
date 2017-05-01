from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.song_list, name='song_list'),
]
