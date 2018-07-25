__author__ = 'jiangshang'
__language__= 'python 3.0'

import json
import time
import random
import requests

import pymysql
import logging
import os
from datetime import datetime
from .DictionaryDB import MysqlDb

import urllib.request


class MyPodcastDb:

    def __init__(self):
        self.m_dbConnect = None


    def initDB(self):
        try:
            if self.m_dbConnect is None:
                self.m_dbConnect = pymysql.connect(host='192.168.48.150',
                                              user='Spui',
                                              passwd='Spui2017',
                                              db='mydb',
                                              port=3306,
                                              charset='utf8')

        except Exception as e:
            raise ('connect error')
            logging.exception(e)


    def  insert_data(self,sqlCommand,valueList):
        try:
            if self.m_dbConnect is None:
                self.initDB()
            cursor = self.m_dbConnect.cursor()
            count = cursor.execute(sqlCommand, valueList)

            #count = cursor.execute(sql, param)
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


insert_sqls = 'insert into pod_station_dummy (sta_kind,sta_artistId,sta_trackName,sta_trackId,sta_collectionId,sta_collectionCensoredName,sta_trackCensoredName,sta_artistName,' \
                           'sta_collectionName,sta_artistViewUrl,sta_collectionViewUrl,sta_feedUrl,sta_trackViewUrl,sta_artworkUrl30,sta_artworkUrl60,sta_collectionPrice,' \
                           'sta_trackPrice,sta_trackRentalPrice,sta_releaseDate,sta_trackCount,sta_country,sta_primaryGenreName,sta_artworkUrl600,sta_genreIds,sta_genres,' \
                           'sta_trackHdPrice,sta_trackHdRentalPrice,sta_wrapperType,sta_trackExplicitness,sta_own_genreIds,sta_artworkUrl100,sta_collectionExplicitness,' \
                           'sta_currency,sta_contentAdvisoryRating) values ' \
                           ' (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s ,%s ,%s ,%s, %s, %s, %s, %s, %s, %s, %s ,%s ,%s, %s,%s, %s, %s, %s, %s)'

header = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.235'
}
timeout = random.choice(range(80, 180))

country_lists = {'da':'DK', 'de':'DE', 'en':'GB', 'es':'ES', 'es-es':'ES', 'fr':'FR', 'fr-fr':'FR', 'it':'IT', 'it-it':'IT', 'ja':'JP', 'ko':'KR', 'nl':'NL'}

def convert_countryCode(lang_code):
    return country_lists[lang_code]

def  get_data(search_key, lang_code, feedUrl):
        try:
            #time.sleep(3)
            url = 'https://itunes.apple.com/search?term={}&entity=podcast&country={}'.format(search_key, convert_countryCode(lang_code))
            html = requests.get(url, headers=header, timeout=timeout).text
            #将 返回数据 解析为 json格式
            xml=json.loads(html)
            myPodcastdb = MyPodcastDb()
            myPodcastdb.initDB()

            #循环访问数据  {'resultCount': 0, 'results': []} 这里 resultCount可能有很多条
            for j in range(xml['resultCount']):
                if (xml['results'][j]['kind'] == 'podcast'):

                    feedUrl = xml['results'][j]['feedUrl']

                    find_category_sql = 'select categories_real_id  from  pod_categories where categories_name  like  "%%%s%%" ' % (
                    xml['results'][j]['primaryGenreName'])
                    resultCategoryData = myPodcastdb.select_data(find_category_sql)
                    print(resultCategoryData['result'][0][0])

                    find_feedUrl_sql = "select * from  pod_station where sta_feedUrl =' " + feedUrl + "'"
                    resultData = myPodcastdb.select_data(find_feedUrl_sql)

                    data = (xml['results'][j]['kind'],
                            str(xml['results'][j]['artistId']) if 'artistId' in xml['results'][j].keys() else " ",
                            xml['results'][j]['trackName'],
                            str(xml['results'][j]['trackId']),
                            str(xml['results'][j]['collectionId']),
                            xml['results'][j]['collectionCensoredName'],
                            xml['results'][j]['trackCensoredName'],
                            xml['results'][j]['artistName'],
                            xml['results'][j]['collectionName'],
                            xml['results'][j]['artistViewUrl'] if 'artistViewUrl' in xml['results'][j].keys() else " ",
                            xml['results'][j]['collectionViewUrl'],
                            xml['results'][j]['feedUrl'],
                            xml['results'][j]['trackViewUrl'],
                            xml['results'][j]['artworkUrl30'],
                            xml['results'][j]['artworkUrl60'],
                            float(xml['results'][j]['collectionPrice']),
                            float(xml['results'][j]['trackPrice']),
                            float(xml['results'][j]['trackRentalPrice']),
                            xml['results'][j]['releaseDate'],
                            int(xml['results'][j]['trackCount']),
                            xml['results'][j]['country'],
                            xml['results'][j]['primaryGenreName'],
                            xml['results'][j]['artworkUrl600'],
                            str(xml['results'][j]['genreIds']),
                            str(xml['results'][j]['genres']),
                            float(xml['results'][j]['trackHdPrice']),
                            float(xml['results'][j]['trackHdRentalPrice']),
                            xml['results'][j]['wrapperType'],
                            xml['results'][j]['trackExplicitness'],
                            resultCategoryData['result'][0][0],
                            xml['results'][j]['artworkUrl100'],
                            xml['results'][j]['collectionExplicitness'],
                            xml['results'][j]['currency'],
                            xml['results'][j]['contentAdvisoryRating'] if 'contentAdvisoryRating' in xml['results'][j].keys() else " ",
                            )

                    if (resultData['num'] > 0):
                        # sql 的数据
                        update_sql = r'update pod_station_dummy set sta_kind="%s" ,sta_artistId="%s",sta_trackName="%s",sta_trackId="%s",sta_collectionId="%s",sta_collectionCensoredName="%s",' \
                                     'sta_trackCensoredName="%s",sta_artistName="%s", sta_collectionName="%s",sta_artistViewUrl="%s",sta_collectionViewUrl="%s",sta_feedUrl="%s",' \
                                     'sta_trackViewUrl="%s",sta_artworkUrl30="%s",sta_artworkUrl60="%s",sta_collectionPrice="%s",sta_trackPrice="%s",' \
                                     'sta_trackRentalPrice="%s",sta_releaseDate="%s",sta_trackCount="%s",sta_country="%s",sta_primaryGenreName="%s",sta_artworkUrl600="%s",sta_genreIds="%s",' \
                                     'sta_genres="%s",sta_trackHdPrice="%s",sta_trackHdRentalPrice="%s",sta_wrapperType="%s",sta_trackExplicitness="%s",sta_own_genreIds="%s",sta_artworkUrl100="%s",' \
                                     'sta_collectionExplicitness="%s",sta_currency="%s",sta_contentAdvisoryRating="%s" where sta_feedUrl="%s"'

                        update_data = list(data)

                        sql = update_sql % (a)
                        print(sql)
                        myPodcastdb.update_data(sql)
                    else:
                        artistId = " "
                        if ('artistId' in xml['results'][j].keys()):
                            artistId = str(xml['results'][j]['artistId'])

                        count = myPodcastdb.insert_data(insert_sqls, list(data))

        except Exception as e:
            print(' exception %s' % e)

def getfreewordSearchPodcastData():
    try:
        mydb = MysqlDb()
        mydb.initDB()
        select_sql = "SELECT * FROM  allwords_list ORDER BY entry;"

        data_Collection = mydb.select_data(select_sql)

        result = data_Collection['result']
        for i in range(data_Collection['num']):
            get_data(result[i][1],  result[i][3], '')

        mydb.close_connect()

        print(result)

        return result
    except Exception as e:
        return None

def get_db():
    db = MysqlDb()
    return db

