import logging
import os
import sys
import time


from .DictionaryDB import MysqlDb

def getImportHistory(language_id, excel_file):

    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql=""
        if language_id == "all":
            select_sql = "SELECT * FROM  proc_list ORDER BY language_id;"
        else:
            select_sql = "SELECT * FROM  proc_list WHERE language_id='" + language_id +"';"

        print(select_sql)
        number = mydb.select_data(select_sql)

        result = number['result']

        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None

def getFreewordSearchData(keyword):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        result= {}
        if is_number(keyword) is False:
            keyword = "%%%%%" + keyword +"%%%%%"
            select_sql = "SELECT * FROM  allwords_list WHERE entry like '" + keyword + \
                         "' or language_id like '" + keyword + "' or interpretation like '" + keyword + "';"
            print(select_sql)

            number = mydb.select_data(select_sql)

            result = number['result']
        else:
            keyword = "%%%%%" + keyword + "%%%%%"
            select_sql = "SELECT * FROM  allwords_list WHERE id like '" + keyword + "' " \
                         "or update_date like '" + keyword +  "';"
            number = mydb.select_data(select_sql)

            result = number['result']


        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None

def getEntryData(keyword, languageID):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        result= {}
        select_sql = "SELECT * FROM  allwords_list WHERE entry = '" + keyword + "' and language_id = '" + languageID + "';"
        print(select_sql)

        number = mydb.select_data(select_sql)

        result = number['result']

        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        pass

    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass

    return False