__author__ = 'swallow'
__language__= 'python 3.0'
#! /usr/bin/python
#coding:utf-8
import logging
import os
import sys
import time

import xlrd

from .DictionaryDB import MysqlDb
from .string_tools import replace_single_quotation
from .updateLanguageData import updateAllwordsData

KEYWORD_COL_NO = 0
TABLE_NAME_ALLWORDS = 'allwords_list'
TABLE_NAME_PROC = 'proc_list'
TABLE_NAME_LANGUAGE = 'language_table'

SHEET_NAME = "word_list"

STATUS_PROCESS_WAIT = 0
STATUS_PROCESSING = 1
STATUS_PROCESS_FINSHED = 2

STATUS_PROCESS_ERROR = -1

class ImportProcessInfo:
    m_rowCount = 0
    m_processedRowNumber = 0
    m_process_status = STATUS_PROCESS_WAIT
    m_process_language = ''
    m_process_comment = None



g_myProcInfoList = {}

def import_excel_dictionary(excel_file, client_info, update_interpre_flag, update_ip, update_user):
    proc_id = client_info.get_proc_id()
    if proc_id is None:
        return

    myProcInfo = ImportProcessInfo()
    myProcInfo.m_rowCount = 0
    myProcInfo.m_processedRowNumber = 0
    myProcInfo.m_process_status = STATUS_PROCESS_WAIT
    myProcInfo.m_process_comment = 'Waiting for processing'

    mydb = MysqlDb()
    mydb.initDB()


    g_myProcInfoList[proc_id] = myProcInfo

    filename = os.path.join(os.getcwd(), excel_file)
    try:
        book = xlrd.open_workbook(excel_file)
        sheet = book.sheet_by_name(SHEET_NAME)

        language_string = sheet.cell(0, KEYWORD_COL_NO).value
        myProcInfo.m_rowCount = sheet.nrows
        myProcInfo.m_process_status = STATUS_PROCESSING
        myProcInfo.m_process_comment = 'Start processing'

        language_id = sheet.cell(0,0).value
        myProcInfo.m_process_language = language_id

        i = 1
        insert_item_count = 0
        while (i < myProcInfo.m_rowCount):
            keyword = sheet.cell(i, 0).value
            word_interpre = ""
            if (sheet.ncols > 1):
                word_interpre = sheet.cell(i, 1).value

            if keyword is None:
                break
            else:
                keyword_in_sql = replace_single_quotation(str(keyword))
                select_sql = "SELECT * FROM " + TABLE_NAME_ALLWORDS + " WHERE entry = '" + keyword_in_sql + "' ;"
                # print (select_sql)
                dataResult = mydb.select_data(select_sql)
                # print(number)
                if (dataResult['num'] == 0):
                    # "INSERT INTO  podcast_keyword_dictionary VALUES (null,'aaaaa','en-gb','2018/1/9');"
                    localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
                    # print("current timestamp is :", localtime)

                    sql = "INSERT INTO " + TABLE_NAME_ALLWORDS + " VALUES (null,'" + keyword_in_sql + "','" \
                          + word_interpre +"','" + language_string + "','" + localtime \
                          + "', null, null, '" + update_ip + "', '" + update_user + "');"
                    print(sql)
                    param = ('test@test.org', 'very-secret')
                    mydb.insert_data(sql, None)
                    insert_item_count += 1
                else:
                    if (update_interpre_flag == 'on'):
                        if word_interpre is not None:
                            stringID = dataResult['result'][0][0]
                            word_interpre_in_sql = replace_single_quotation(str(word_interpre))
                            updateAllwordsData(stringID, keyword, word_interpre, update_ip, update_user)

                    else:
                        print(keyword_in_sql + " already existed.")

            myProcInfo.m_processedRowNumber = i
            i += 1

        myProcInfo.m_process_status = STATUS_PROCESS_FINSHED
        myProcInfo.m_process_comment = 'Normal finshed'

        mydb.close_connect()

        base_excel_file = os.path.basename(excel_file)
        saveClientInfoToDB(language_id, base_excel_file, insert_item_count, client_info)
        insertLanguageDB(language_id, base_excel_file, update_ip, update_user)
        del g_myProcInfoList[proc_id]

        return True
    except Exception as e:
        logging.exception(e)
        myProcInfo.m_process_status = STATUS_PROCESS_ERROR
        myProcInfo.m_process_comment = e.args[0]
        mydb.close_connect()

        return False

def saveClientInfoToDB(language_id, excel_file, insert_item_count, client_info):
    proc_id = client_info.get_proc_id()
    if proc_id is None:
        return

    mydb = MysqlDb()
    mydb.initDB()

    ip_address = client_info.get_ipaddress()
    city_name = client_info.get_city()
    region_name = client_info.get_region()
    country_name = client_info.get_country()
    latitude = client_info.get_latitude()
    longitude = client_info.get_longitude()
    time_zone = client_info.get_timezone()


    select_sql = "SELECT * FROM " + TABLE_NAME_PROC + " WHERE proc_id = '" + proc_id + "' ;"
    # print (select_sql)
    number = mydb.select_data(select_sql)
    # print(number)
    if (number['num'] == 0):
        localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())

        sql = "INSERT INTO " + TABLE_NAME_PROC + " VALUES ('" + language_id + "','" + excel_file + "', " + str(insert_item_count) + ",'" +\
              proc_id + "','" + ip_address + "','" + city_name + "','" + region_name + "','" + country_name + \
              "','" + latitude + "','" + longitude + "','" + time_zone + "','" + localtime + "');"
        print(sql)
        param = ('test@test.org', 'very-secret')
        mydb.insert_data(sql, None)
    else:
        print(" proc " + proc_id + " already existed. Wrong import task")

    mydb.close_connect()

def findInDB(proc_id):
    mydb = MysqlDb()
    mydb.initDB()
    select_sql = "SELECT * FROM " + TABLE_NAME_PROC + " WHERE proc_id = '" + proc_id + "' ;"
    number = mydb.select_data(select_sql)
    mydb.close_connect()
    # print(number)
    return number


def getCurrentProcessRate(proc_id):
    procInfo = g_myProcInfoList.get(proc_id, None)
    if procInfo is None:
        data = findInDB(proc_id)
        result = data['result']
        num = data['num']
        if num > 0:
            return 100
        else:
            return 0
    elif procInfo.m_rowCount is 0:
        return 0
    else:
        return (int((procInfo.m_processedRowNumber * 100)/procInfo.m_rowCount))

def getCurrentProcessStatus(proc_id):
    procInfo = g_myProcInfoList.get(proc_id, None)
    if procInfo is None:
        data = findInDB(proc_id)
        result = data['result']
        num = data['num']
        if num > 0:
            return STATUS_PROCESS_FINSHED
        else:
            return STATUS_PROCESS_WAIT

    return procInfo.m_process_status

def getCurrentProcessComment(proc_id):
    procInfo = g_myProcInfoList.get(proc_id, None)
    if procInfo is None:
        data = findInDB(proc_id)
        result = data['result']
        num = data['num']
        if num > 0:
            return 'Normal finshed'
        else:
            return 'Not started'

    return procInfo.m_process_comment

def getCurrentProcessLanguage(proc_id):
    procInfo = g_myProcInfoList.get(proc_id, None)
    if procInfo is None:
        data = findInDB(proc_id)
        result = data['result']
        num = data['num']

        if num > 0:
            return result[0][0]
        else:
            return "null"

    return procInfo.m_process_language

def insertLanguageDB(language_id, language_file, update_ip, update_user):

    mydb = MysqlDb()
    mydb.initDB()

    select_sql = "SELECT * FROM " + TABLE_NAME_LANGUAGE + " WHERE language_id = '" + language_id + \
                 "' and language_file = '" + language_file + "';"

    result = mydb.select_data(select_sql)
    if (result['num'] == 0):
        sql = "INSERT INTO " + TABLE_NAME_LANGUAGE + " VALUES ('" \
              + language_id + "','" + language_file + "','"+ update_ip +"', '" + update_user + "');"
        param = ('test@test.org', 'very-secret')
        mydb.insert_data(sql, None)

    mydb.close_connect()


if __name__ == '__main__':
    if len(sys.argv) != 1:
        print( 'Start generating...')
        import_excel_dictionary(sys.argv[1], '0000')
        exit()
    else:
        print('Please input command such as:')
        print('python importKeywordDictionary.py xxxx.xlsx')