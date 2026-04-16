
import os, joblib
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression

BASE=os.path.dirname(__file__)
MODEL=os.path.join(BASE,'model.pkl')
VEC=os.path.join(BASE,'vec.pkl')

def train():
 data=fetch_20newsgroups(subset='train')
 vec=TfidfVectorizer(max_features=5000,stop_words='english')
 X=vec.fit_transform(data.data)
 model=LinearSVC()
 model.fit(X,data.target)
 joblib.dump(model,MODEL)
 joblib.dump(vec,VEC)

def predict(text):
 model=joblib.load(MODEL)
 vec=joblib.load(VEC)
 X=vec.transform([text])
 return str(model.predict(X)[0])

def extract_keywords(text):
 return ",".join(text.split()[:10])
