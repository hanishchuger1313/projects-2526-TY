
from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from .ml_model import train,predict,extract_keywords
from .models import Document

@login_required
def index(request):
 docs=Document.objects.filter(user=request.user)
 return render(request,'index.html',{'docs':docs})

@login_required
def upload(request):
 if request.method=='POST':
  f=request.FILES['file']
  text=f.read().decode('utf-8','ignore')
  train()
  cat=predict(text)
  keys=extract_keywords(text)
  Document.objects.create(user=request.user,file=f,category=cat,keywords=keys)
 return redirect('/')
