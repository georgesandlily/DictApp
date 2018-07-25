import os
from django.db import models
from django.core.files.storage import FileSystemStorage
from django.conf import settings

class OverwriteStorage(FileSystemStorage):
    '''
    Muda o comportamento padrão do Django e o faz sobrescrever arquivos de
    mesmo nome que foram carregados pelo usuário ao invés de renomeá-los.
    '''
    def get_available_name(self, name):
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return name


# Create your models here.
class dictionaryModel(models.Model):

    language_file = models.FileField(upload_to='./')

    #language_file = models.FileField(upload_to='./upload/', storage=OverwriteStorage())

    @property
    def __unicode__(self):
        return self.language_file