import logging
import os
import sys
import time


from .DictionaryDB import MysqlDb
from .string_tools import replace_single_quotation

def insertNewVBMistakeData(vb_id, entry_id, update_ip, update_user):
    mydb = MysqlDb()
    mydb.initDB()

    selectSql = "SELECT * FROM vb_mistake_list" + " WHERE id_vb = " + vb_id + " and id_entry = " + entry_id + ";"
    # print (select_sql)
    number = mydb.select_data(selectSql)

    count = 0
    # print(number)
    localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())
    insertSql = ''
    if (number['num'] == 0):
        insertSql = "INSERT INTO vb_mistake_list" + " VALUES ("+ vb_id +" ,0," + entry_id + ",'" + localtime + "', '" + update_ip + "', '" + update_user + "');"
        print(insertSql)
        count = mydb.insert_data(insertSql, None)
    else:
        print("already in mistake book" )

    mydb.close_connect()

    result = {'vb_mistake_count': count}

    return result


def getVBMistakeRecord(vb_id):
    mydb = MysqlDb()
    mydb.initDB()

    selectSql = "SELECT DISTINCT * FROM vb_mistake_list" + " WHERE id_vb = " + vb_id + ";"
    # print (select_sql)
    result = mydb.select_data(selectSql)
    mydb.close_connect()

    return result['result']


def getVBMistakeAllwordsData(vb_id):
    try:
        mydb = MysqlDb()
        mydb.initDB()
        selectSql = "SELECT id_entry FROM vb_mistake_list WHERE id_vb = " + vb_id + ";"
        #WHERE language_file = '" + excel_file + "' ;"
        dataCollection = mydb.select_data(selectSql)

        result = dataCollection['result']
        count = dataCollection['num']

        allData = []

        for i in range(0, count):
            selectAllwordsSql = "SELECT * FROM  allwords_list WHERE id = " +  str(result[i][0]) + " ;"
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


def updateVBMistakeData(vb_data, update_ip, update_user):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        vb_data = vb_data.split("],")

        updateCount = 0
        for x in range(len(vb_data)):
            entryInfo = vb_data[x].lstrip("'")
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
                selectSql = "SELECT * FROM  vb_mistake_list WHERE id_vb = " + vbID + " and id_entry = " + entryId + " ;"
                data_Collection = mydb.select_data(selectSql)
                if (data_Collection['num'] == 0):
                    insertResult = insertNewVBMistakeData(vbID, entryId, update_ip, update_user)

                    updateCount += insertResult
            else:

                deleteSql = "DELETE FROM vb_mistake_list WHERE id_vb = " + vbID + " and id_entry = " + entryId + " ;"
                deleteResult = mydb.delete_data(deleteSql)

                updateCount += deleteResult['num']

        mydb.close_connect()


        return updateCount
    except Exception as e:
        logging.exception(e)
        return None