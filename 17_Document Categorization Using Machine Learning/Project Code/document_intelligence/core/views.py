


# import os
# import zipfile
# import tempfile

# from django.shortcuts import render, redirect
# from django.contrib import messages

# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# from .models import Document


# CATEGORY_KEYWORDS = {
#     "Sports": "cricket football match tournament player score team olympics stadium coach",
#     "Technical": "software hardware programming python java computer ai machine learning data algorithm",
#     "Education": "school college university exam syllabus teacher student subject classroom",
#     "Politics": "government election minister parliament policy law democracy vote constitution",
#     "Legal": "court judge lawyer act section legal case petition constitution justice",
#     "Entertainment": "movie music cinema actor actress show television dance song film"
# }



# def landing(request):
#     return render(request, "landing.html")


# def extract_keywords(text, top_n=5):
#     if not text.strip():
#         return ""

#     vectorizer = TfidfVectorizer(stop_words="english")
#     tfidf_matrix = vectorizer.fit_transform([text])

#     feature_array = vectorizer.get_feature_names_out()
#     tfidf_scores = tfidf_matrix.toarray()[0]

#     sorted_indices = tfidf_scores.argsort()[-top_n:][::-1]

#     top_keywords = [
#         feature_array[i]
#         for i in sorted_indices
#         if tfidf_scores[i] > 0
#     ]

#     return ", ".join(top_keywords)


# def predict_category(text):
#     if not text.strip():
#         return "Unknown"

#     documents = list(CATEGORY_KEYWORDS.values())
#     labels = list(CATEGORY_KEYWORDS.keys())

#     vectorizer = TfidfVectorizer(stop_words="english")
#     tfidf_matrix = vectorizer.fit_transform(documents + [text])

#     similarity = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
#     scores = similarity[0]

#     best_index = scores.argmax()
#     return labels[best_index]


# def upload_zip(request):

#     if request.method == "POST":

#         zip_file = request.FILES.get("zip_file")

#         if not zip_file:
#             messages.error(request, "No file selected")
#             return redirect("upload")

#         if not zipfile.is_zipfile(zip_file):
#             messages.error(request, "Invalid ZIP file")
#             return redirect("upload")

#         with tempfile.TemporaryDirectory() as temp_dir:

#             zip_path = os.path.join(temp_dir, zip_file.name)

#             with open(zip_path, "wb+") as destination:
#                 for chunk in zip_file.chunks():
#                     destination.write(chunk)

#             with zipfile.ZipFile(zip_path, "r") as zip_ref:
#                 zip_ref.extractall(temp_dir)

#             for root, dirs, files in os.walk(temp_dir):
#                 for file in files:

#                     if file.lower().endswith(".txt"):

#                         file_path = os.path.join(root, file)

#                         with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
#                             content = f.read()

#                         category = predict_category(content)
#                         keywords = extract_keywords(content)

#                         Document.objects.create(
#                             file_name=file,
#                             predicted_category=category,
#                             keywords=keywords
#                         )

#         messages.success(request, "Files categorized successfully!")
#         return redirect("dashboard")

#     return render(request, "upload.html")


# def dashboard(request):

#     categories = Document.objects.values_list(
#         "predicted_category",
#         flat=True
#     ).distinct()

#     category_data = []

#     for category in categories:
#         count = Document.objects.filter(
#             predicted_category=category
#         ).count()

#         category_data.append({
#             "name": category,
#             "count": count
#         })

#     return render(request, "dashboard.html", {
#         "categories": category_data
#     })


# def category_view(request, category_name):

#     documents = Document.objects.filter(
#         predicted_category=category_name
#     ).order_by("-uploaded_at")

#     for doc in documents:
#         if doc.keywords:
#             doc.keyword_list = [
#                 k.strip() for k in doc.keywords.split(",")
#             ]
#         else:
#             doc.keyword_list = []

#     return render(request, "category_files.html", {
#         "category": category_name,
#         "documents": documents
#     })







# import os
# import zipfile
# import tempfile

# from django.shortcuts import render, redirect
# from django.contrib import messages
# from django.db.models import Count

# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity

# from .models import Document


# CATEGORY_KEYWORDS = {
#     "Sports": "cricket football match tournament player score team olympics stadium coach fifa ipl",
#     "Technology": "software hardware programming python java computer ai machine learning data algorithm blockchain cloud cybersecurity",
#     "Education": "school college university exam syllabus teacher student subject classroom research academic",
#     "Politics": "government election minister parliament policy law democracy vote constitution international national",
#     "Legal": "court judge lawyer act section legal case petition justice constitution rights law",
#     "Entertainment": "movie music cinema actor actress show television dance song film webseries ott",
#     "Healthcare": "hospital doctor patient treatment medicine surgery vaccine health disease medical research",
#     "Business": "market stock finance economy startup investment company trade profit industry"
# }



# def landing(request):
#     return render(request, "landing.html")



# def extract_keywords(text, top_n=5):
#     if not text.strip():
#         return ""

#     vectorizer = TfidfVectorizer(stop_words="english")
#     tfidf_matrix = vectorizer.fit_transform([text])

#     feature_array = vectorizer.get_feature_names_out()
#     tfidf_scores = tfidf_matrix.toarray()[0]

#     sorted_indices = tfidf_scores.argsort()[-top_n:][::-1]

#     top_keywords = [
#         feature_array[i]
#         for i in sorted_indices
#         if tfidf_scores[i] > 0
#     ]

#     return ", ".join(top_keywords)



# def predict_category(text):
#     if not text.strip():
#         return "Unknown", 0

#     documents = list(CATEGORY_KEYWORDS.values())
#     labels = list(CATEGORY_KEYWORDS.keys())

#     vectorizer = TfidfVectorizer(stop_words="english")
#     tfidf_matrix = vectorizer.fit_transform(documents + [text])

#     similarity = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
#     scores = similarity[0]

#     best_index = scores.argmax()
#     confidence = round(float(scores[best_index]) * 100, 2)

#     return labels[best_index], confidence



# def upload_zip(request):

#     if request.method == "POST":

#         zip_file = request.FILES.get("zip_file")

#         if not zip_file:
#             messages.error(request, "No file selected")
#             return redirect("upload")

#         if not zipfile.is_zipfile(zip_file):
#             messages.error(request, "Invalid ZIP file")
#             return redirect("upload")

#         total_files = 0
#         total_confidence = 0

#         with tempfile.TemporaryDirectory() as temp_dir:

#             zip_path = os.path.join(temp_dir, zip_file.name)

#             with open(zip_path, "wb+") as destination:
#                 for chunk in zip_file.chunks():
#                     destination.write(chunk)

#             with zipfile.ZipFile(zip_path, "r") as zip_ref:
#                 zip_ref.extractall(temp_dir)

#             for root, dirs, files in os.walk(temp_dir):
#                 for file in files:

#                     if file.lower().endswith(".txt"):

#                         file_path = os.path.join(root, file)

#                         with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
#                             content = f.read()

#                         category, confidence = predict_category(content)
#                         keywords = extract_keywords(content)

#                         Document.objects.create(
#                             file_name=file,
#                             predicted_category=category,
#                             keywords=keywords,
#                             confidence_score=confidence
#                         )

#                         total_files += 1
#                         total_confidence += confidence

#         if total_files == 0:
#             messages.error(request, "No text files found in ZIP.")
#             return redirect("upload")

#         avg_confidence = round(total_confidence / total_files, 2)


#         request.session["metrics"] = {
#             "total_files": total_files,
#             "avg_confidence": avg_confidence
#         }

#         return redirect("dashboard")

#     return render(request, "upload.html")



# def dashboard(request):

#     category_counts = (
#         Document.objects
#         .values("predicted_category")
#         .annotate(count=Count("id"))
#     )

#     total_documents = Document.objects.count()

#     metrics = request.session.get("metrics", {})

#     return render(request, "dashboard.html", {
#         "categories": category_counts,
#         "total_documents": total_documents,
#         "total_files": metrics.get("total_files", 0),
#         "avg_confidence": metrics.get("avg_confidence", 0)
#     })



# def category_view(request, category_name):

#     documents = (
#         Document.objects
#         .filter(predicted_category=category_name)
#         .order_by("-uploaded_at")
#     )

#     for doc in documents:
#         if doc.keywords:
#             doc.keyword_list = [
#                 k.strip() for k in doc.keywords.split(",")
#             ]
#         else:
#             doc.keyword_list = []

#     return render(request, "category_files.html", {
#         "category": category_name,
#         "documents": documents
#     })



import os
import zipfile
import tempfile

from django.shortcuts import render, redirect
from django.contrib import messages
from django.db.models import Count

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .models import Document


# ==========================================================
# CATEGORY DEFINITIONS
# ==========================================================
CATEGORY_KEYWORDS = {
    "Sports": "cricket football match tournament player score team olympics stadium coach fifa ipl",
    "Technology": "software hardware programming python java computer ai machine learning data algorithm blockchain cloud cybersecurity",
    "Education": "school college university exam syllabus teacher student subject classroom research academic",
    "Politics": "government election minister parliament policy law democracy vote constitution international national",
    "Legal": "court judge lawyer act section legal case petition justice constitution rights law",
    "Entertainment": "movie music cinema actor actress show television dance song film webseries ott",
    "Healthcare": "hospital doctor patient treatment medicine surgery vaccine health disease medical research",
    "Business": "market stock finance economy startup investment company trade profit industry"
}


# ==========================================================
# LANDING PAGE
# ==========================================================
def landing(request):
    return render(request, "landing.html")


# ==========================================================
# KEYWORD EXTRACTION
# ==========================================================
def extract_keywords(text, top_n=5):
    if not text.strip():
        return ""

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform([text])

    feature_array = vectorizer.get_feature_names_out()
    tfidf_scores = tfidf_matrix.toarray()[0]

    sorted_indices = tfidf_scores.argsort()[-top_n:][::-1]

    top_keywords = [
        feature_array[i]
        for i in sorted_indices
        if tfidf_scores[i] > 0
    ]

    return ", ".join(top_keywords)


# ==========================================================
# CATEGORY PREDICTION WITH CONFIDENCE
# ==========================================================
def predict_category(text):
    if not text.strip():
        return "Other", 0

    documents = list(CATEGORY_KEYWORDS.values())
    labels = list(CATEGORY_KEYWORDS.keys())

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(documents + [text])

    similarity = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    scores = similarity[0]

    best_index = scores.argmax()
    confidence = round(float(scores[best_index]) * 100, 2)

    return labels[best_index], confidence


# ==========================================================
# ZIP UPLOAD + PROCESSING
# ==========================================================
def upload_zip(request):

    if request.method == "POST":

        zip_file = request.FILES.get("zip_file")

        if not zip_file:
            messages.error(request, "No file selected")
            return redirect("upload")

        if not zipfile.is_zipfile(zip_file):
            messages.error(request, "Invalid ZIP file")
            return redirect("upload")

        total_files = 0
        total_confidence = 0

        with tempfile.TemporaryDirectory() as temp_dir:

            zip_path = os.path.join(temp_dir, zip_file.name)

            # Save uploaded ZIP temporarily
            with open(zip_path, "wb+") as destination:
                for chunk in zip_file.chunks():
                    destination.write(chunk)

            # Extract ZIP
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(temp_dir)

            # Process TXT files
            for root, dirs, files in os.walk(temp_dir):
                for file in files:

                    if file.lower().endswith(".txt"):

                        file_path = os.path.join(root, file)

                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()

                        category, confidence = predict_category(content)
                        keywords = extract_keywords(content)

                        Document.objects.create(
                            file_name=file,
                            predicted_category=category,
                            keywords=keywords,
                            confidence_score=confidence
                        )

                        total_files += 1
                        total_confidence += confidence

        if total_files == 0:
            messages.error(request, "No text files found in ZIP.")
            return redirect("upload")

        avg_confidence = round(total_confidence / total_files, 2)

        # Store metrics in session
        request.session["metrics"] = {
            "total_files": total_files,
            "avg_confidence": avg_confidence
        }

        # 🔥 Redirect to metrics page (IMPORTANT FIX)
        return redirect("metrics_page")

    return render(request, "upload.html")


# ==========================================================
# METRICS PAGE (NEW)
# ==========================================================
def metrics_page(request):

    metrics = request.session.get("metrics")

    if not metrics:
        return redirect("dashboard")

    return render(request, "metrics.html", {
        "metrics": metrics
    })


# ==========================================================
# DASHBOARD
# ==========================================================
def dashboard(request):

    category_counts = (
        Document.objects
        .exclude(predicted_category__isnull=True)
        .exclude(predicted_category="")
        .values("predicted_category")
        .annotate(count=Count("id"))
    )

    total_documents = Document.objects.count()

    metrics = request.session.get("metrics", {})

    return render(request, "dashboard.html", {
        "categories": category_counts,
        "total_documents": total_documents,
        "total_files": metrics.get("total_files", 0),
        "avg_confidence": metrics.get("avg_confidence", 0)
    })


# ==========================================================
# CATEGORY FILE VIEW
# ==========================================================
def category_view(request, category_name):

    documents = (
        Document.objects
        .filter(predicted_category=category_name)
        .order_by("-uploaded_at")
    )

    for doc in documents:
        doc.keyword_list = (
            [k.strip() for k in doc.keywords.split(",")]
            if doc.keywords else []
        )

    return render(request, "category_files.html", {
        "category": category_name,
        "documents": documents
    })