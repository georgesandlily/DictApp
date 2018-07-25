import time

import os

from threading import Thread

from django import forms
from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt

import json
from .client_management.clientManagement import clientInfo
from .models import dictionaryModel
from .tools.ImportKeywordDictionary import getCurrentProcessComment
from .tools.ImportKeywordDictionary import getCurrentProcessRate
from .tools.ImportKeywordDictionary import getCurrentProcessStatus
from .tools.ImportKeywordDictionary import getCurrentProcessLanguage
from .tools.ImportKeywordDictionary import import_excel_dictionary

from .tools.SearchImportHistory import getImportHistory
from .tools.SearchImportHistory import getFreewordSearchData
from .tools.SearchImportHistory import getEntryData

from .tools.GetLanguageInfo import getLanguageList
from .tools.GetLanguageInfo import getLanguageData
from .tools.GetLanguageInfo import getTextAudioFile
from .tools.GetLanguageInfo import getEnglishAudioFile

from .tools.updateLanguageData import updateAllwordsData
from .tools.updateLanguageData import updateAllwordsData_audio

from .tools.AzureTranslateAPI import GetTextAndTranslate
from .tools.AzureTranslateAPI import GetTextDetected
from .tools.AzureTranslateAPI import GetTextSpeak

from .tools.editVBData import insertNewVBData
from .tools.editVBData import getVBList
from .tools.editVBData import getVBData
from .tools.editVBData import getVBAllwordsData
from .tools.editVBData import updateVBData

from .tools.editVBMistakeBook import insertNewVBMistakeData
from .tools.editVBMistakeBook import getVBMistakeRecord
from .tools.editVBMistakeBook import getVBMistakeAllwordsData
from .tools.editVBMistakeBook import updateVBMistakeData

from .tools.AzureAuth import AzureAuthClient

from .tools.insertAllwordsData import insertAllwordsData
from .tools.user_management import userLogin
from .tools.user_management import createNewUser

from .tools.getPodcastFromiTunes import getfreewordSearchPodcastData
from .tools.updateDataFromCambridge import getDataFromCambridgeDictionary
from .tools.updateDataFromCambridge import updateEntryDataFromCambridgeDictionary
from .tools.updateDataFromCambridge import update_allwordsPhonogram
from .tools.updateDataFromCambridge import getAudioFilePathFromCambridge

from django.conf import settings
from django.shortcuts import redirect

# Create your views here.

#from .forms import AddForm
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required

from django.template.loader import get_template

class AddForm(forms.Form):
    language_file = forms.FileField()


class UserForm(forms.Form):
    username = forms.CharField(max_length=30)
    password = forms.CharField(max_length=50)
    email = forms.CharField(max_length=255)


class myTask:
    def __init__(self):
        self._running = True

    def terminate(self):
        self._running = False

    def run(self, excel_file, client_info, update_interpre_flag, update_ip, update_user):
        print ("start importing：" + excel_file)
        import_excel_dictionary(excel_file, client_info, update_interpre_flag, update_ip, update_user)
        print ("end importing：" + excel_file)


def register_view(req):
    context = {}
    if req.method == 'POST':
        form = UserForm(req.POST)
        if form.is_valid():
            #获得表单数据
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']

            # 判断用户是否存在
            user = auth.authenticate(username = username,password = password)
            if user:
                context['userExit']=True
                return render(req, 'register.html', context)


            #添加到数据库（还可以加一些字段的处理）
            user = User.objects.create_user(username=username, password=password)
            user.save()

            #添加到session
            req.session['username'] = username
            #调用auth登录
            auth.login(req, user)
            #重定向到首页
            return redirect('/')
    else:
        context = {'isLogin':False}
    #将req 、页面 、以及context{}（要传入html文件中的内容包含在字典里）返回
    return  render(req,'register.html',context)


def get_importingRate(request):
    proc_id = request.GET['proc_id']
    data = {
        'current_rate': getCurrentProcessRate(proc_id),
        'current_status': getCurrentProcessStatus(proc_id),
        'status_comment': getCurrentProcessComment(proc_id),
        'language_ID': getCurrentProcessLanguage(proc_id),
    }

    return JsonResponse(data)

def get_importHistory(request):
    current_language = request.GET['current_language']
    data = {
        'result_list': getImportHistory(current_language, None)
    }

    return JsonResponse(data)

def get_languageList(request):
    proc_id = request.GET['proc_id']
    current_status = -1
    if proc_id is not None:
        current_status = getCurrentProcessStatus(proc_id)
    data = {
        'result_list': getLanguageList(),
        'task_status': current_status
    }

    return JsonResponse(data)

def get_languageData(request):
    language_code = request.GET['current_language']
    data = {
        'result_list': getLanguageData(language_code),
    }

    return JsonResponse(data)

def get_freesearch(request):
    search_string = request.GET['search_string']
    data = {
        'result_list':getFreewordSearchData(search_string),
    }

    return JsonResponse(data)

def set_allwordsData(request):
    entry_content = request.GET['entry_content']
    string_id = request.GET['string_id']
    interpretation = request.GET['interpretation']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    data = {
        'result': updateAllwordsData(string_id, entry_content, interpretation, update_ip, update_user),
    }

    return JsonResponse(data)

def get_translateWord(request):
    sourceText = request.GET['source_text']
    destLang = request.GET['dest_lang']
    stringID = request.GET['string_id']
    languageID = request.GET['language_id']

    if languageID == '':
        languageID = GetTextDetected(sourceText)

    translateString = ""

    if languageID == 'en':
        dataResult = getDataFromCambridgeDictionary(stringID, sourceText)
        translateString = dataResult['new_interpre']
        if translateString == "" :
            translateString = GetTextAndTranslate(sourceText, languageID, destLang)

    else:
        translateString = GetTextAndTranslate(sourceText, languageID, destLang)

    data = {
        'source_Text': sourceText,
        'translated_text': translateString,
        'language_ID': languageID,
        'string_ID': stringID,
        #'synthesis_string': GetTextSpeak(sourceText),
    }

    return JsonResponse(data)

def play_text_audio(request):
    sourceText = request.GET['source_text']
    languageCode = request.GET['language_code']
    stringID  = request.GET['string_id']

    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    filePath = None
    resString = ""
    if ((languageCode == "uk") or (languageCode == "us")):
        allEnglishInfo = getEnglishAudioFile(stringID)

        if allEnglishInfo['cam_data'] == 0:
            camData = getDataFromCambridgeDictionary(stringID, sourceText)
            if ((camData['uk_audio'] is None) and (camData['us_audio'] is None)):
                if (allEnglishInfo['en_audio'] is None):
                    filePath = GetTextSpeak(stringID, sourceText, 'en') # get data from azura
                    updateAllwordsData_audio(stringID, filePath, update_ip, update_user)
                    resString = "get new audio from azura"
                else:
                    filePath=allEnglishInfo['en_audio']
                    resString = "get audio from azura"

                    # check file exit in os
                    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    full_path = os.path.dirname(filePath)
                    if (os.path.exists(os.path.join(BASE_DIR, filePath.lstrip('/'))) == False):
                        filePath = GetTextSpeak(stringID, sourceText, 'en')
            else:
                update_allwordsPhonogram(stringID, "", camData)
                if (languageCode == "uk"):
                    filePath = camData['uk_audio']
                    if filePath is not None:
                        resString = "get audio from cambridge"
                    else:
                        resString = "No uk audio from cambridge"

                if (languageCode == "us"):
                    filePath = camData['us_audio']
                    if filePath is not None:
                        resString = "get audio from cambridge"
                    else:
                        resString = "No us audio from cambridge"

        else:
            if(languageCode == "uk"):
                if allEnglishInfo['uk_audio'] is not None:
                    filePath = allEnglishInfo['uk_audio']
                    resString = "get audio from cambridge"
                else:
                    filePath = allEnglishInfo['en_audio']
                    resString = "get audio from azura"

            if (languageCode == "us"):
                if allEnglishInfo['us_audio'] is not None:
                    filePath = allEnglishInfo['us_audio']
                    resString = "get audio from cambridge"
                else:
                    filePath = allEnglishInfo['en_audio']
                    resString = "get audio from azura"

            #check file exit in os
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            full_path = os.path.dirname(filePath)
            if (os.path.exists(os.path.join(BASE_DIR, filePath.lstrip('/'))) == False):
                if (languageCode == "uk"):
                    filePath =  getAudioFilePathFromCambridge(stringID, allEnglishInfo['uk_url'], "uk")
                if (languageCode == "us"):
                    filePath = getAudioFilePathFromCambridge(stringID, allEnglishInfo['us_url'], "us")
    else:
        result = getTextAudioFile(stringID)

        if (len(result) > 0 ):
            filePath = result[0][6]

            if filePath is None:
                filePath = GetTextSpeak(stringID, sourceText,languageCode)
                updateAllwordsData_audio(stringID, filePath, update_ip, update_user)
            else:
                #check file exit in os
                BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                full_path = os.path.dirname(filePath)
                if (os.path.exists(os.path.join(BASE_DIR, filePath.lstrip('/'))) == False):
                    filePath = GetTextSpeak(stringID, sourceText, languageCode)

            resString = "get audio from azura"
        else:
            resString = "no audio"

    data = {
            'src_path': filePath,
            'result_string': resString,
        }

    return JsonResponse(data)

def insert_allwordsData(request):
    entry_content = request.GET['entry_content']
    interpretation = request.GET['interpretation']
    language_id = request.GET['language_id']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']


    result = insertAllwordsData(entry_content, language_id, interpretation, update_ip, update_user)
    data = {
        'insert_data': getEntryData(entry_content,language_id),
        'insert_count': result['entry_count'],
        'insert_lang_code_count':result['lang_code_count'],
    }
    return JsonResponse(data)

def set_newVBData(request):
    vbName = request.GET['vb_name']
    vbDesc = request.GET['vb_desc']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    data = {
        'insert_data':insertNewVBData(vbName, vbDesc, update_ip, update_user)
    }

    return JsonResponse(data)

def get_vbList(request):
    userName = request.GET['user_name']
    data = {
        'result_list': getVBList(userName),
    }

    return JsonResponse(data)

def get_vbData(request):

    vbID = request.GET['vb_id']
    data = {
        'result_list': getVBData(vbID),
    }

    return JsonResponse(data)

def update_vbData(request):

    vbData = request.GET['vb_data']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    data = {
        'update_count': updateVBData(vbData, update_ip, update_user),
    }

    return JsonResponse(data)

def get_vbAllwordsData(request):

    vbID = request.GET['vb_id']
    data = {
        'vb_entry_id_list': getVBData(vbID),
        'vb_allwords_list': getVBAllwordsData(vbID),
    }
    return JsonResponse(data)

def update_vbMistakeData(request):

    vbMistakeData = request.GET['vb_mistake_data']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    data = {
        'update_count': updateVBMistakeData(vbMistakeData, update_ip,update_user),
    }

    return JsonResponse(data)

def set_vbMistakeRecord(request):
    vbID = request.GET['vb_id']
    entryID = request.GET['entry_id']
    update_ip = request.GET['update_ip']
    update_user = request.GET['update_user']

    data = {
        'vb_mistake_list': insertNewVBMistakeData(vbID, entryID, update_ip, update_user)
    }
    return JsonResponse(data)

def get_vbMistakeRecord(request):
    vbID = request.GET['vb_id']
    data = {
        'vb_mistake_list': getVBMistakeRecord(vbID)
    }
    return JsonResponse(data)

def get_vbMistakeAllwords(request):
    vbID = request.GET['vb_id']
    data = {
        'vb_mistake_allwords_list': getVBMistakeAllwordsData(vbID)
    }
    return JsonResponse(data)

def user_login(request):
    username=request.POST.get("user_name")
    password=request.POST.get("user_password")

    data = {
        'user_permitted': userLogin(username, password)
    }
    return JsonResponse(data)

def create_newUser(request):
    username=request.POST.get("user_name")
    password=request.POST.get("user_password")
    email = request.POST.get("user_email")
    ip = request.POST.get('update_ip')

    data = {
        'user_created': createNewUser(username, password, email, ip)
    }

    return JsonResponse(data)


def search_podcast(request):
    data = {

        'search_result': getfreewordSearchPodcastData()
    }

    return JsonResponse(data)

def update_fromCambridge(request):
    print("come")
    data = {
        'search_result': updateEntryDataFromCambridgeDictionary()
    }

    return JsonResponse(data)



def index(request):
    if request.method == 'POST':
        ip_address = request.POST.get('ip_address')
        city = request.POST.get('city')
        region = request.POST.get('region')
        country = request.POST.get('country')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        time_zone = request.POST.get('time_zone')
        update_interpre_flag = request.POST.get('update_check')
        update_user = request.POST.get('update_user')

        timeStamp = time.strftime("%Y%m%d%H%M%S", time.localtime())

        if request.session.session_key is None:
            request.session.save()
        proc_id = request.session.session_key + timeStamp

        myclient = clientInfo(proc_id, ip_address, city, region, country, latitude,longitude,time_zone)

        form = AddForm(request.POST, request.FILES)

        if form.is_valid():
            language_file = form.cleaned_data['language_file']

            myModel = dictionaryModel()
            myModel.language_file = language_file

            fullpath_file = os.path.join(settings.MEDIA_ROOT, myModel.language_file.file.name)
            if os.path.exists(fullpath_file):
                os.remove(fullpath_file)

            myModel.save()

            import_file_path = myModel.language_file.file.name

            importThread = myTask()
            t = Thread(target=importThread.run, args=(import_file_path, myclient,update_interpre_flag, ip_address, update_user))
            t.daemon = True
            t.start()
            #form = AddForm()

            return render(request, 'index.html', {'proc_id': proc_id, 'language_file':language_file,'form': form})

        else:
            return HttpResponse('something wrong!')

    else:
        form = AddForm()

    return render(request, 'index.html', {'form': form})

@csrf_exempt
def create_user(request):
    #get请求就返回创建用户页面
    if request.method == 'GET':
        return render(request, 'create_user.html')
     #post请求就执行创建操作
    elif request.method == 'POST':
        try:
            username = request.POST.get('createUsername')
            password = request.POST.get('password')
            email = request.POST.get('email')
            # 明文密码经过加密处理
            passwords = make_password(password,None,'pbkdf2_sha256')
            print('getpassword is value:',passwords)
            createResult = UserModel.objects.create(username = username,password = passwords,email = email)
            #createResult. set_password(passwords)
            createResult.save()
            return HttpResponse('1')
        except:
            return HttpResponse('-1')

@csrf_exempt
def delete_user(request,id):
    if request.method == 'GET':
        try:
            result = UserModel.objects.filter(id=id)
            result.delete()
            return HttpResponse('success')
        except:
            return HttpResponse('fail')

@csrf_exempt
def editUser(request,id):
    if request.method == 'GET':
        #result = User.objects.filter(id)
        result = UserModel.objects.filter(id=id)
        #print("需要修改的用户名为：".format(result))
        template = get_template('update_user.html')
        html = template.render({'content': result})
        return HttpResponse(html)

@csrf_exempt
def change_password(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            oldPassword = request.POST.get('oldPassword')
            newPassword = request.POST.get('newPassword')
            name = UserModel.objects.filter(username=username)
            for item in name:
                getpwd = item.password
                #判断获取到的密码跟数据库的密码是否一致
                ck = check_password(oldPassword, getpwd)
                if ck:
                    cknewpassword = make_password(newPassword, None, 'pbkdf2_sha256')
                    #新密码进行加密并修改保存在数据库
                    item.password = cknewpassword
                    item.save()
                    return HttpResponse('1')
                else:
                    return HttpResponse('-1')
        except Exception as e:
           print(e)
        return HttpResponse('-1')

#用户列表
@csrf_exempt
def listUser(request):
    #查询用户所有的数据
    result = UserModel.objects.all()
    template = get_template('list.html')
    html = template.render({'content':result})
    return HttpResponse(html)
