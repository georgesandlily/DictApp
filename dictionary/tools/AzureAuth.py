"""
 Code example for getting a Microsoft Translator access token from the Azure Platform.
 Visit http://docs.microsofttranslator.com/oauth-token.html to view the API reference
 for Microsoft Azure Cognitive Services authentication service.
 """
from datetime import timedelta
from datetime import datetime

import requests

class AzureAuthClient(object):

    """
     Provides a client for obtaining an OAuth token from the authentication service
     for Microsoft Translator in Azure Cognitive Services.
     """

    def __init__(self, client_secret):
        self.client_secret = 'None'
        self.token = None
        self.reuse_token_until = None

    def get_access_token(self):

        if (self.token is None) or (datetime.utcnow() > self.reuse_token_until):
            token_service_url = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken'
            request_headers = {'Ocp-Apim-Subscription-Key': self.client_secret}
            response = requests.post(token_service_url, headers=request_headers)

            response.raise_for_status()

            self.token = response.content
            self.reuse_token_until = datetime.utcnow() + timedelta(minutes=5)


        return self.token
