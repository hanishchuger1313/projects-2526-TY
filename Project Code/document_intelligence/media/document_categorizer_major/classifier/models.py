
from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    file = models.FileField(upload_to='docs/')
    category = models.CharField(max_length=100)
    keywords = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
