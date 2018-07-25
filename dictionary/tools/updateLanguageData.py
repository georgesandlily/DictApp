import logging
import os
import sys
import time
from .string_tools import replace_single_quotation

from .DictionaryDB import MysqlDb

def updateAllwordsData(string_id, entry_content, entry_interpre, update_ip, update_user):
    result = {}
    try:
        mydb = MysqlDb()
        mydb.initDB()
        localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
        entryInSql = replace_single_quotation(str(entry_content))
        entryInterpreSql = replace_single_quotation(str(entry_interpre))
        updateSql = "UPDATE allwords_list SET entry = '" + entryInSql + "', update_date = '" + localtime \
                     + "', interpretation = '" + entryInterpreSql + "', " + "update_ip_identify = '" + update_ip \
                     + "', update_user = '" + update_user \
                     + "' WHERE id=" + string_id + ";"

        print(updateSql)
        ret = mydb.update_data(updateSql)

        selectSql = "SELECT * FROM  allwords_list WHERE id ='" + string_id + "';"
        number = mydb.select_data(selectSql)

        mydb.close_connect()
        result = number['result']
        return result
    except Exception as e:
        logging.exception(e)
        return result



def updateAllwordsData_audio(string_id, audio_file, update_ip, update_user):
    result = {}
    try:
        mydb = MysqlDb()
        mydb.initDB()
        localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
        audioFileInSql = replace_single_quotation(str(audio_file))

        updateSql="UPDATE allwords_list SET audio_filename = '" + audioFileInSql + "', update_date = '" + localtime + "', "\
                  + "update_ip_identify = '" + update_ip + "', update_user = '" + update_user + "'  WHERE id= " + string_id +";"

        print(updateSql)
        ret = mydb.update_data(updateSql)

        selectSql = "SELECT * FROM  allwords_list WHERE id =" + string_id + ";"
        number = mydb.select_data(selectSql)

        mydb.close_connect()
        result = number['result']
        return result
    except Exception as e:
        logging.exception(e)
        return result