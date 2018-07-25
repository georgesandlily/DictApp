import logging
import os
import sys
import time


from .DictionaryDB import MysqlDb
from .string_tools import replace_single_quotation

def insertAllwordsData(entry_content, language_id, interpretation, update_ip, update_user):
    mydb = MysqlDb()
    mydb.initDB()

    keywordInSql = replace_single_quotation(str(entry_content))
    selectSql = "SELECT * FROM allwords_list" + " WHERE entry = '" + keywordInSql + "' and language_id = '"  + language_id + "';"
    # print (select_sql)
    number = mydb.select_data(selectSql)

    count = 0
    # print(number)
    if (number['num'] == 0):
        # "INSERT INTO  podcast_keyword_dictionary VALUES (null,'aaaaa','en-gb','2018/1/9');"
        localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
        # print("current timestamp is :", localtime)

        sql = "INSERT INTO allwords_list" + " VALUES (null,'" + keywordInSql + "','"+ interpretation\
              + "','" + language_id + "','" + localtime + "', null, null, '" + update_ip + "', '" + update_user + "');"
        print(sql)
        param = ('test@test.org', 'very-secret')
        count = mydb.insert_data(sql, None)
    else:
        print(keywordInSql + " already existed.")


    selectLangSql = "SELECT * FROM language_table" + " WHERE language_id = '" + language_id + "' ;"
    # print (select_sql)
    lang_data = mydb.select_data(selectLangSql)

    lang_code_count = 0
    if(lang_data['num'] == 0):
        newLangSql = "INSERT INTO language_table VALUES('" + language_id + "', 'manual_insert', '" + update_ip +"','" + update_user + "');"
        print (newLangSql)
        param = ('test@test.org', 'very-secret')
        lang_code_count = mydb.insert_data(newLangSql, None)

    mydb.close_connect()

    result = {'entry_count':count, 'lang_code_count':lang_code_count}

    return result