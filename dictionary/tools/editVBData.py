import logging
import os
import sys
import time


from .DictionaryDB import MysqlDb
from .string_tools import replace_single_quotation

def insertNewVBData(vb_name, vb_desc, update_ip, update_user):
    mydb = MysqlDb()
    mydb.initDB()

    keyword_in_sql = replace_single_quotation(str(vb_name))
    selectSql = "SELECT * FROM vb_list" + " WHERE vb_name = '" + keyword_in_sql + "';"
    # print (select_sql)
    number = mydb.select_data(selectSql)

    count = 0
    # print(number)
    localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
    if (number['num'] == 0):
        sql = "INSERT INTO vb_list" + " VALUES (null,'" + keyword_in_sql + "','"+ replace_single_quotation(vb_desc)+ "','" + localtime + "', '" + update_ip + "', '" + update_user +"');"
        print(sql)
        param = ('test@test.org', 'very-secret')
        count = mydb.insert_data(sql, None)
        number = mydb.select_data(selectSql)
    else:
        update_sql = "UPDATE vb_list SET vb_desc = '" + replace_single_quotation(vb_desc) + "', update_date = '" + localtime + "' WHERE vb_name = '" + vb_name + "';";
        print(update_sql)
        count = mydb.update_data(update_sql)
        number = mydb.select_data(selectSql)

    mydb.close_connect()

    result = {'vb_count': count,'vb_data': number['result']}

    return result


def getVBList(userName):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql = "SELECT * FROM  vb_list WHERE update_user= '" + userName + "' ORDER BY vb_name ;"
        #WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['result']

        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None

def getVBData(vb_id):
    try:
        mydb = MysqlDb()
        mydb.initDB()
        selectSql = "SELECT * FROM  vocabulary_table WHERE id_vb_table = " + vb_id + " ;"
        #WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(selectSql)

        result = data_Collection['result']

        mydb.close_connect()

        return result
    except Exception as e:
        logging.exception(e)
        return None


def getVBAllwordsData(vb_id):
    try:
        mydb = MysqlDb()
        mydb.initDB()
        selectSql = "SELECT * FROM  vocabulary_table WHERE id_vb_table = " + vb_id + ";"
        #WHERE language_file = '" + excel_file + "' ;"
        data_Collection = mydb.select_data(selectSql)

        result = data_Collection['result']
        count = data_Collection['num']

        allData = []

        for i in range(0, count):
            selectAllwordsSql = "SELECT * FROM  allwords_list WHERE id = " +  str(result[i][1]) + " ;"
            print(selectAllwordsSql)
            allwordsData = mydb.select_data(selectAllwordsSql)
            for j in range(0, allwordsData['num']):
                allData.append(allwordsData['result'][0])

        mydb.close_connect()
        allData.sort();
        print(allData)
        return allData
    except Exception as e:
        logging.exception(e)
        return None

def updateVBData(vbData, update_ip, update_user):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        vbData = vbData.split("],")

        updateCount = 0
        for x in range(len(vbData)):
            entryInfo = vbData[x].lstrip("'")
            entryInfo = entryInfo.rstrip("'")

            entryInfo = entryInfo.lstrip("[")
            entryInfo = entryInfo.rstrip("[")

            entryInfo = entryInfo.lstrip("]")
            entryInfo = entryInfo.rstrip("]")

            entryInfo = entryInfo.split(",")

            vbID = entryInfo[0]
            vbID = vbID.lstrip("\"")
            vbID = vbID.rstrip("\"")

            entryId = entryInfo[1]
            entryId = eval(entryId)

            opeID = int(entryInfo[2])

            result = 0

            if (opeID == 0):
                selectSql = "SELECT * FROM  vocabulary_table WHERE id_vb_table = " + vbID + " and id_entry = " + entryId + " ;"
                data_Collection = mydb.select_data(selectSql)
                if (data_Collection['num'] == 0):
                    localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
                    insertSql = "INSERT INTO vocabulary_table  VALUES (" + vbID + ", " +  entryId + ",'" + localtime + "', '" + update_ip + "', '" + update_user + "');"
                    print(insertSql)
                    insertResult = mydb.insert_data(insertSql, None)

                    updateCount += insertResult
            else:

                deleteSql = "DELETE FROM vocabulary_table WHERE id_vb_table = " + vbID + " and id_entry = " + entryId + " ;"
                deleteResult = mydb.delete_data(deleteSql)

                updateCount += deleteResult['num']

        mydb.close_connect()


        return updateCount
    except Exception as e:
        logging.exception(e)
        return None


def insertVBData(id_vb, id_entry, update_ip, update_user):

    try:
        mydb = MysqlDb()
        mydb.initDB()
        # "INSERT INTO  podcast_keyword_dictionary VALUES (null,'aaaaa','en-gb','2018/1/9');"
        localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
        # print("current timestamp is :", localtime)

        sql = "INSERT INTO vocabulary_table" + " VALUES ('" + id_vb + "', '" +  id_entry + "','" + localtime + "', '" + update_ip + "', '" + update_user + "');"
        print(sql)

        count = mydb.insert_data(sql, None)
        mydb.close_connect()

        return count
    except Exception as e:
        logging.exception(e)
        return None
