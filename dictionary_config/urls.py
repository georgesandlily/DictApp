"""locallibrary URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
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
from django.contrib import admin
from django.urls import path
from django.urls import include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static


from dictionary import views as dictionary_views

urlpatterns = [
    path('admin/', admin.site.urls),
    #path('',learn_views.index),
    path('dictionary/', dictionary_views.index),
    path('user/', dictionary_views.create_user),
    path('ajax/user_login/', dictionary_views.user_login),
    path('ajax/get_importHistory/', dictionary_views.get_importHistory),
    path('ajax/get_importingRate/', dictionary_views.get_importingRate),
    path('ajax/get_languageList/', dictionary_views.get_languageList),
    path('ajax/get_languageData/', dictionary_views.get_languageData),
    path('ajax/get_freesearch/', dictionary_views.get_freesearch),
    path('ajax/set_allwordsData/', dictionary_views.set_allwordsData),
    path('ajax/get_translateWord/', dictionary_views.get_translateWord),
    path('ajax/insert_allwordsData/', dictionary_views.insert_allwordsData),
    path('ajax/play_text_audio/', dictionary_views.play_text_audio),

    path('ajax/set_newVBData/', dictionary_views.set_newVBData),
    path('ajax/get_vbList/', dictionary_views.get_vbList),
    path('ajax/get_vbData/', dictionary_views.get_vbData),
    path('ajax/update_vbData/', dictionary_views.update_vbData),
    path('ajax/get_vbAllwordsData/', dictionary_views.get_vbAllwordsData),
    path('ajax/set_vbMistakeRecord/', dictionary_views.set_vbMistakeRecord),
    path('ajax/get_vbMistakeRecord/', dictionary_views.get_vbMistakeRecord),
    path('ajax/get_vbMistakeAllwords/', dictionary_views.get_vbMistakeAllwords),

    path('ajax/update_vbMistakeData/', dictionary_views.update_vbMistakeData),
    path('ajax/create_newUser/', dictionary_views.create_newUser),


    path('ajax/search_podcast/', dictionary_views.search_podcast),
    path('ajax/update_cambridge/', dictionary_views.update_fromCambridge),

]
