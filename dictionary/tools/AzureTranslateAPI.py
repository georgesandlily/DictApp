"""
 Example application showing the use of the Translate method in the Text Translation API.
"""

from xml.etree import ElementTree

from .AzureAuth import AzureAuthClient

import requests
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO

import os

import wave

import struct

doItAgain = "yes"
TEXT_AUDIO_FILENAME = "text.wav"

def GetTextAndTranslate(sourceText, fromLangCode, toLangCode):

    headers = {"Ocp-Apim-Subscription-key": 'none'}

    translateUrl = ''
    if fromLangCode != '' :
        translateUrl = "http://api.microsofttranslator.com/v2/Http.svc/Translate?text={}&from={}&to={}".format(sourceText,fromLangCode, toLangCode)
    else:
        translateUrl = "http://api.microsofttranslator.com/v2/Http.svc/Translate?text={}&to={}".format(sourceText,toLangCode)
    translationData= requests.get(translateUrl, headers = headers)
    translation = ElementTree.fromstring(translationData.text.encode('utf-8'))

    return translation.text


def GetTextDetected(sourceText):

    detect_url = "https://api.microsofttranslator.com/V2/Http.svc/Detect?text={}".format(sourceText)
    headers = {"Ocp-Apim-Subscription-key": '35b90ab65dd445c08be2f08e17b09110'}

    detectData= requests.get(detect_url, headers = headers)
    detect_langCode = ElementTree.fromstring(detectData.text.encode('utf-8'))

    return detect_langCode.text

def GetTextSpeak(stringID, sourceText, languageCode):
    speak_url= "https://api.microsofttranslator.com/V2/Http.svc/Speak?text={}&language={}".format(sourceText, languageCode)

    headers = {"Ocp-Apim-Subscription-key": '35b90ab65dd445c08be2f08e17b09110'}

    speakData= requests.get(speak_url, headers = headers)
    #speak_langCode = ElementTree.fromstring(speakData.text.encode('utf-8'))

    return_path = None
    if (speakData.status_code == 200):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        AUDIO_ROOT = os.path.dirname(BASE_DIR)
        #file_name = os.path.join(AUDIO_ROOT, 'test.wave')

        arr = os.listdir(AUDIO_ROOT)
        STATIC_PATH = 'static'
        MEDIA_STORE_PATH = 'Media_store'
        if STATIC_PATH in arr :
            static_path = os.path.join(AUDIO_ROOT, STATIC_PATH)
            arr = os.listdir(static_path)
            if MEDIA_STORE_PATH in arr:
                media_store_path = os.path.join(static_path, MEDIA_STORE_PATH)
                fileName = str(stringID) + ".mp3"
                file_fullname = os.path.join(media_store_path, fileName) #TEXT_AUDIO_FILENAME
                try:
                    with open(file_fullname, 'wb+') as f:
                        f.write(speakData.content)

                        #sound = AudioSegment.from_wav(file_fullname)
                        #sound.export("/output/path/file.wav", format="mp3")

                        return_path = '/' + STATIC_PATH + '/' + MEDIA_STORE_PATH +'/'+ fileName
                        #AudioSegment.from_wav("/input/file.wav").export("/output/file.mp3", format="mp3")
                        #sound.export(return_path, format="mp3")

                except:
                    print("File Error")

    return return_path


def get_wave_header(frame_rate):
    """
     Generate WAV header that precedes actual audio data sent to the speech translation service.

     :param frame_rate: Sampling frequency (8000 for 8kHz or 16000 for 16kHz).
     :return: binary string
     """
    if frame_rate not in [8000, 16000]:
        raise ValueError("Sampling frequency, frame_rate, should be 8000 or 16000.")

    nchannels = 1
    bytes_per_sample = 2

    output = StringIO.StringIO()
    output.write('RIFF')
    output.write(struct.pack('<L', 0))
    output.write('WAVE')
    output.write('fmt ')
    output.write(struct.pack('<L', 18))
    output.write(struct.pack('<H', 0x0001))
    output.write(struct.pack('<H', nchannels))
    output.write(struct.pack('<L', frame_rate))
    output.write(struct.pack('<L', frame_rate * nchannels * bytes_per_sample))
    output.write(struct.pack('<H', nchannels * bytes_per_sample))
    output.write(struct.pack('<H', bytes_per_sample * 8))
    output.write(struct.pack('<H', 0))
    output.write('data')
    output.write(struct.pack('<L', 0))

    data = output.getvalue()

    output.close()

    return data

if __name__ == "__main__":
    client_secret = 'ENTER_YOUR_CLIENT_SECRET'
    auth_client = AzureAuthClient(client_secret)
    bearer_token = 'Bearer ' + auth_client.get_access_token()

    while (doItAgain == 'yes') or (doItAgain == 'Yes'):
        GetTextAndTranslate(bearer_token)

