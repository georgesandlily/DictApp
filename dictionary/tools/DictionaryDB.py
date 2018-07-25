#! /usr/bin/python
# coding:utf-8
import sys
import os
import time

import pymysql
import logging

class MysqlDb:

    def __init__(self):
        self.m_dbConnect = None


    def initDB(self):
        try:
            if self.m_dbConnect is None:
                self.m_dbConnect = pymysql.connect(host='localhost',
                                              user='root',
                                              passwd='',
                                              db='',
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
