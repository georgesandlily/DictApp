import logging
import os
import sys
import time


from .DictionaryDB import MysqlDb

def getLanguageList():
    try:
        mydb = MysqlDb()
        mydb.initDB()


        select_sql = "SELECT * FROM  language_table ORDER BY language_id ;"
        #WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['result']

        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None


def getLanguageData(language_id):
    try:
        mydb = MysqlDb()
        mydb.initDB()


        select_sql = "SELECT * FROM  allwords_list WHERE language_id ='" + language_id + "' ORDER BY entry;"
        #WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['result']

        mydb.close_connect()

        #print(result)

        return result
    except Exception as e:
        logging.exception(e)
        return None

def getTextAudioFile(stringID):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql = "SELECT * FROM  allwords_list WHERE id ='" + stringID + "';"
        # WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['result']

        mydb.close_connect()

        print(result)

        return result
    except Exception as e:
        logging.exception(e)
        return None


def getEnglishAudioFile(stringID):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        selectSql = "SELECT * FROM  english_audio_filelist WHERE id_entry ='%s';" % (stringID)
        dataUKYSCollection = mydb.select_data(selectSql)

        selectSql = "SELECT * FROM  allwords_list WHERE id ='" + stringID + "';"
        dataCollection = mydb.select_data(selectSql)

        mydb.close_connect()

        result = {}
        if dataUKYSCollection['num'] > 0 :
             result = {'en_audio': dataCollection['result'][0][6],
                       'uk_url':dataUKYSCollection['result'][0][1],
                       'uk_audio':dataUKYSCollection['result'][0][2],
                       'us_url':dataUKYSCollection['result'][0][3],
                       'us_audio':dataUKYSCollection['result'][0][4],
                       'cam_data':dataUKYSCollection['num']}
        else:
            if dataCollection['num'] > 0:
                result = {'en_audio': dataCollection['result'][0][6],
                          'uk_url':None,
                          'uk_audio':None,
                          'us_url':None,
                          'us_audio':None,
                          'cam_data':0}
            else:
                result = {'en_audio': None,
                          'uk_url':None,
                          'uk_audio':None,
                          'us_url':None,
                          'us_audio':None,
                          'cam_date':0}


        return result
    except Exception as e:
        logging.exception(e)
        return None

