import logging
import os
import sys
import time

from .DictionaryDB import MysqlDb


def userLogin(username, password):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql = "SELECT * FROM  user_list WHERE user_name = '" + username + "' and user_password = '" + password +"';"

        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['num']

        mydb.close_connect()

        if (result == 0):
            return 0
        else:
            return 1
    except Exception as e:
        logging.exception(e)
        return -1

def createNewUser(username ,password, email, ip):
    try:
        mydb = MysqlDb()
        mydb.initDB()

        select_sql = "SELECT * FROM  user_list WHERE user_name = '" + username + "' and user_password = '" + password +"';"
        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['num']

        if result == 0:
            localtime = time.strftime("%Y%m%d%H%M%S", time.localtime())

            insSql="INSERT INTO user_list VALUES (null, '" + username + "', '" + password + "', '" + ip + "' , '" + localtime + "');"
            print(insSql)
            param = ('test@test.org', 'very-secret')
            result = mydb.insert_data(insSql, None)
            mydb.close_connect()

            return result
    except Exception as e:
        logging.exception(e)
        return result