import json
import time
import random
import requests

import pymysql
import logging
import os
from datetime import datetime
#from .DictionaryDB import MysqlDb

class MysqlDb:

    def __init__(self):
        self.m_dbConnect = None


    def initDB(self):
        try:
            if self.m_dbConnect is None:
                self.m_dbConnect = pymysql.connect(host='localhost',
                                              user='root',
                                              passwd='swallow1',
                                              db='dictionary_db',
                                              port=3306,
                                              charset='utf8')

        except Exception as e:
            raise ('connect error')
            logging.exception(e)


    def  insert_data(self,sql,param):
        try:
            if self.m_dbConnect is None:
                self.initDB()
            cursor = self.m_dbConnect.cursor()
            count = cursor.execute(sql, param)
            self.m_dbConnect.commit()
            return count
        except Exception as e:
            self.m_dbConnect.rollback()
            logging.exception(e)

    def select_data(self,sql):
        try:
            if self.m_dbConnect is None:
                self.initDB()
            cursor = self.m_dbConnect.cursor()
            ###sql = 'select sta_trackName,sta_feedUrl from pod_station '
            number = cursor.execute(sql)
            # lists = []
            results = list(cursor.fetchall())
            paramter = {'num': number, 'result': results}
            return paramter
        except Exception as e:
            logging.exception(e)

    def delete_data(self,sql):
        try:
            if self.m_dbConnect is None:
                self.initDB()
            cursor = self.m_dbConnect.cursor()
            ###sql = 'select sta_trackName,sta_feedUrl from pod_station '
            number = cursor.execute(sql)
            self.m_dbConnect.commit()
            # lists = []
            results = list(cursor.fetchall())
            paramter = {'num': number, 'result': results}

            return paramter
        except Exception as e:
            logging.exception(e)

    def close_connect(self):
        if self.m_dbConnect is None:
            return
        cursor = self.m_dbConnect.cursor()
        if cursor != " ":
            cursor.close()
        if self.m_dbConnect != " ":
            self.m_dbConnect.close()
        self.m_dbConnect = None

    def update_data(self,sql):
        try:
            if self.m_dbConnect is None:
                self.initDB()
            cursor = self.m_dbConnect.cursor()
            count = cursor.execute(sql)
            self.m_dbConnect.commit()
            return count
        except Exception as e:
            self.m_dbConnect.rollback()
            logging.exception(e)


header = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.235'
}
timeout = random.choice(range(80, 180))

def updateEntryDataFromCambridgeDictionary():
    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql = "SELECT * FROM  allwords_list where language_id = '%s' ORDER BY entry;" % ("en")
        # WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(select_sql)
        #print(select_sql)

        result = data_Collection['result']
        for i in range(data_Collection['num']):

            selectSql = "SELECT * FROM english_audio_filelist WHERE id_entry = '%s';" % (result[i][0])
            #print(selectSql)
            number = mydb.select_data(selectSql)
            
            if (number['num'] == 0):
                cambridgeData = getDataFromCambridgeDictionary(result[i][0], result[i][1])

                if cambridgeData['new_interpre'] != "":
                    update_allwordsPhonogram(result[i][0], result[i][2], cambridgeData)
            else:
                print(result[i][1]+" has cambridge data.")

        mydb.close_connect()

        print(result)

        return result
    except Exception as e:
        return None


def getDataFromCambridgeDictionary(stringID, search_key):
    try:
        #url = 'https://dictionary.cambridge.org/dictionary/english/' + search_key
        url = 'https://dictionary.cambridge.org/dictionary/english-chinese-simplified/' + search_key
        html = requests.get(url, headers=header, timeout=timeout).text

        wordsFeature = ""
        ukPhonogramStr = ""
        usPhonogramStr = ""
        transString = ""
        uk_mp3_file = None
        uk_mp3_url = None
        us_mp3_file = None
        us_mp3_url = None

        print("get data frome cambridge")

        # Get entry feature
        index = html.find("A word that")
        if index > 0 :
            html = html[index:]
            index = html.find("</span>")
            if index > 0:
                wordsFeature = html[0:index]
                index = wordsFeature.find(">")
                wordsFeature = wordsFeature[index+1:]
                print(wordsFeature)
        else:
            print("word feature not found")

        # Get uk pron
        index0 = html.find('class="region">uk')

        if index0 > 0:
            html = html[index0:]

            # Get uk mp3
            index0 = html.find('listen to British English pronunciation" data-src-mp3="')
            if index0 > 0:
                html = html[index0 + len('listen to British English pronunciation" data-src-mp3="'):]
                index1 = html.find('"')
                if index1 > 0:
                    uk_mp3_url = html[0:index1]
                    uk_mp3_file = getAudioFilePathFromCambridge(stringID, uk_mp3_url, "uk")

            index1 = html.find('class="ipa">')
            if index1 > 0:

                html = html[(index1+len('class="ipa">')):]
                index2 = html.find("</span")
                ukPhonogramStr = html[0:index2]
                index3 = ukPhonogramStr.find('<span class="sp">')
                if (index3 > 0) :
                    ukPhonogramStr = ukPhonogramStr[0:index3]
                ukPhonogramStr = " uk: [" + ukPhonogramStr + "] "
                print(search_key + ukPhonogramStr)
        else:

            print("uk pron not found")

        # Get us pron
        index0 = html.find('class="region">us')
        if index0 > 0:
            html = html[index0:]
            # Get uk mp3
            index0 = html.find('listen to American pronunciation" data-src-mp3="')
            if index0 > 0:
                html = html[index0 + len('listen to American pronunciation" data-src-mp3="'):]
                index1 = html.find('"')
                if index1 > 0:
                    us_mp3_url = html[0:index1]
                    us_mp3_file = getAudioFilePathFromCambridge(stringID, us_mp3_url, "us")

            index1 = html.find('class="ipa">')
            if index1 > 0:
                html = html[(index1 + len('class="ipa">')):]
                index2 = html.find("</span")
                usPhonogramStr = html[0:index2]
                index3 = usPhonogramStr.find('<span class="sp">')
                if (index3 > 0):
                    usPhonogramStr = usPhonogramStr[0:index3]
                usPhonogramStr = " us: [" + usPhonogramStr + "] "
                print(search_key + usPhonogramStr)
        else:
            print("us pron not found")

        # Get translation string
        index0 = html.find('class="trans" lang="zh-Hans"')
        if index0 > 0:
            html = html[index0:]
            index1 = html.find('</span>')
            if index1 > 0:
                transString = html[0:index1]
                index3 = transString.find('zh-Hans">')
                if index3 > 0:
                    transString = transString[index3 + len('zh-Hans">'):]
                    transString = transString.strip().lstrip().rstrip('\n')
                print(transString)
        else:
            print("no translate")

        return {'new_interpre':wordsFeature + ukPhonogramStr + usPhonogramStr + transString,
                'uk_audio': uk_mp3_file, 'uk_audio_url':uk_mp3_url,'us_audio_url':us_mp3_url, 'us_audio':us_mp3_file}

    except Exception as e:
        return None


def update_allwordsPhonogram(id, oldinterpre, cambridgeData):
    mydb = MysqlDb()
    mydb.initDB()

    updateSql = ""
    localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())

    phonogramStr = cambridgeData['new_interpre']
    ukAudio = cambridgeData['uk_audio']
    ukAudio_url = cambridgeData['uk_audio_url']
    usAudio = cambridgeData['us_audio']
    usAudio_url = cambridgeData['us_audio_url']

    if phonogramStr == "" :
        updateSql = "update allwords_list set interpretation = '%s', update_date = '%s', " \
                    "update_user = '%s' where id = '%s';" % \
                    (oldinterpre, localtime, "admin", id)
    else:
        updateSql = "update allwords_list set interpretation = '%s', update_date = '%s', " \
                    "update_user = '%s' where id = '%s';" % \
                    (phonogramStr, localtime, "admin", id)

    print(updateSql)
    ret = mydb.update_data(updateSql)

    selectSql = "SELECT * FROM english_audio_filelist WHERE id_entry = '%s';" % (id)
    number = mydb.select_data(selectSql)
    print(selectSql)
    count = 0
    # print(number)
    if (number['num'] == 0):
        ins_sql = "INSERT INTO english_audio_filelist" + " VALUES ('%s','%s','%s', '%s', '%s', '%s', '%s', '%s');" % \
              (id, ukAudio_url, ukAudio, usAudio_url, usAudio, localtime, "", "admin")

        print(ins_sql)
        param = ('test@test.org', 'very-secret')
        count = mydb.insert_data(ins_sql, None)
    else:
        upd_sql = "update english_audio_filelist set update_date = '%s', audio_uk_url = '%s', audio_uk_filename = '%s', " \
                  "audio_us_url = '%s', audio_us_filename = '%s' where id_entry = '%s';" % \
                  (localtime, ukAudio_url, ukAudio, usAudio_url, usAudio, id)
        print(upd_sql)
        ret = mydb.update_data(upd_sql)


    mydb.close_connect()


def getAudioFilePathFromCambridge(stringID, speak_url, countryCode):

    if stringID == '':
        return ''

    speakData = requests.get(speak_url, headers=header)
    return_path = None
    if (speakData.status_code == 200):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        AUDIO_ROOT = os.path.dirname(BASE_DIR)
        # file_name = os.path.join(AUDIO_ROOT, 'test.wave')

        arr = os.listdir(AUDIO_ROOT)
        STATIC_PATH = 'static'
        MEDIA_STORE_PATH = 'Media_store'
        if STATIC_PATH in arr:
            static_path = os.path.join(AUDIO_ROOT, STATIC_PATH)
            arr = os.listdir(static_path)
            if MEDIA_STORE_PATH in arr:
                media_store_path = os.path.join(static_path, MEDIA_STORE_PATH)
                media_store_path = os.path.join(media_store_path, countryCode)
                if not os.path.exists(media_store_path):
                    os.mkdir(media_store_path)
                fileName = str(stringID) + "_" + countryCode +  ".mp3"
                file_fullname = os.path.join(media_store_path, fileName)  # TEXT_AUDIO_FILENAME
                try:
                    with open(file_fullname, 'wb+') as f:
                        f.write(speakData.content)
                        return_path = '/' + STATIC_PATH + '/' + MEDIA_STORE_PATH + '/' + countryCode + '/' + fileName
                except:
                    print("File Error")

    return return_path



if __name__ == "__main__":
    print("start getting data from cambridge...")    
    updateEntryDataFromCambridgeDictionary()
    print("getting data from cambridge finished...")    
