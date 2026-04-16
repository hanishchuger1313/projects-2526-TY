

# from django.shortcuts import render, redirect
# from django.contrib.auth.decorators import login_required
# from .ml_model import predict, extract_keywords
# from .models import Document


# @login_required
# def index(request):
#     docs = Document.objects.filter(user=request.user).order_by('-created')

#     # Convert comma string into list for template
#     for doc in docs:
#         if doc.keywords:
#             doc.keyword_list = [k.strip() for k in doc.keywords.split(',')]
#         else:
#             doc.keyword_list = []

#     return render(request, 'index.html', {'docs': docs})


# @login_required
# def upload(request):
#     if request.method == 'POST' and request.FILES.get('file'):
#         f = request.FILES['file']

#         try:
#             text = f.read().decode('utf-8', 'ignore')
#         except:
#             text = ""

#         if text.strip():   # Only process if file has text
#             category = predict(text)
#             keywords = extract_keywords(text)
#         else:
#             category = "Unknown"
#             keywords = ""

#         # IMPORTANT: Reset file pointer before saving
#         f.seek(0)

#         Document.objects.create(
#             user=request.user,
#             file=f,
#             category=category,
#             keywords=keywords
#         )

#     return redirect('home')   # Use named URL instead of '/'


# from django.shortcuts import render, redirect, get_object_or_404
# from django.contrib.auth.decorators import login_required
# from django.contrib import messages
# from django.db.models import Count
# from .ml_model import predict, extract_keywords
# from .models import Document


# @login_required
# def index(request):
#     category_filter = request.GET.get('category')

#     docs = Document.objects.filter(user=request.user)

#     # Apply category filter if selected
#     if category_filter:
#         docs = docs.filter(category=category_filter)

#     docs = docs.order_by('-created')

#     # Convert keywords string into list
#     for doc in docs:
#         if doc.keywords:
#             doc.keyword_list = [k.strip() for k in doc.keywords.split(',')]
#         else:
#             doc.keyword_list = []

#     # Dashboard statistics
#     total_docs = Document.objects.filter(user=request.user).count()

#     category_counts = (
#         Document.objects
#         .filter(user=request.user)
#         .values('category')
#         .annotate(count=Count('category'))
#     )

#     # Unique categories for filter dropdown
#     categories = (
#         Document.objects
#         .filter(user=request.user)
#         .values_list('category', flat=True)
#         .distinct()
#     )

#     return render(request, 'index.html', {
#         'docs': docs,
#         'categories': categories,
#         'selected_category': category_filter,
#         'total_docs': total_docs,
#         'category_counts': category_counts
#     })


# @login_required
# def upload(request):
#     if request.method == 'POST' and request.FILES.get('file'):
#         f = request.FILES['file']

#         try:
#             text = f.read().decode('utf-8', 'ignore')
#         except:
#             text = ""

#         if text.strip():
#             category = predict(text)
#             keywords = extract_keywords(text)
#         else:
#             category = "Unknown"
#             keywords = ""

#         f.seek(0)

#         Document.objects.create(
#             user=request.user,
#             file=f,
#             category=category,
#             keywords=keywords
#         )

#         messages.success(request, "Document uploaded successfully.")

#     return redirect('home')


# @login_required
# def delete_document(request, doc_id):
#     doc = get_object_or_404(Document, id=doc_id, user=request.user)

#     if request.method == "POST":
#         doc.file.delete()
#         doc.delete()
#         messages.success(request, "Document deleted successfully.")

#     return redirect('home')

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .ml_model import predict, extract_keywords
from .models import Document


@login_required
def index(request):
    category_filter = request.GET.get('category')

    docs = Document.objects.filter(user=request.user)

    if category_filter:
        docs = docs.filter(category=category_filter)

    docs = docs.order_by('-created')

    # Convert keywords string into list
    for doc in docs:
        if doc.keywords:
            doc.keyword_list = [k.strip() for k in doc.keywords.split(',')]
        else:
            doc.keyword_list = []

    total_docs = Document.objects.filter(user=request.user).count()

    categories = (
        Document.objects
        .filter(user=request.user)
        .values_list('category', flat=True)
        .distinct()
    )

    return render(request, 'index.html', {
        'docs': docs,
        'categories': categories,
        'selected_category': category_filter,
        'total_docs': total_docs,
    })


@login_required
def upload(request):
    if request.method == 'POST' and request.FILES.get('file'):
        f = request.FILES['file']

        try:
            text = f.read().decode('utf-8', 'ignore')
        except:
            text = ""

        if text.strip():
            category = predict(text)
            keywords = extract_keywords(text)
        else:
            category = "Unknown"
            keywords = ""

        f.seek(0)

        Document.objects.create(
            user=request.user,
            file=f,
            category=category,
            keywords=keywords
        )

        messages.success(request, "Document uploaded successfully.")

    return redirect('home')


@login_required
def delete_document(request, doc_id):
    doc = get_object_or_404(Document, id=doc_id, user=request.user)

    if request.method == "POST":
        doc.file.delete()
        doc.delete()
        messages.success(request, "Document deleted successfully.")

    return redirect('home')