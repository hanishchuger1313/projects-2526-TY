

import re
from sklearn.feature_extraction.text import TfidfVectorizer


def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text


def extract_keywords_tfidf(text, num_keywords=5):

    text = clean_text(text)

    if len(text.strip()) < 10:
        return "No significant keywords"

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=1000
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_array = vectorizer.get_feature_names_out()
        tfidf_scores = tfidf_matrix.toarray()[0]

        top_indices = tfidf_scores.argsort()[-num_keywords:][::-1]
        top_keywords = [feature_array[i] for i in top_indices]

        return ", ".join(top_keywords)

    except:
        return "Keyword extraction failed"


def predict_category(text):

    categories = {
        "Sports": ["cricket", "football", "match", "score", "tournament"],
        "Technical": ["python", "django", "software", "code", "programming"],
        "Education": ["school", "college", "exam", "student", "university"],
        "Politics": ["government", "election", "minister", "policy"],
        "Legal": ["court", "law", "legal", "judge", "case"],
        "Entertainment": ["movie", "music", "film", "actor", "celebrity"]
    }

    text_lower = text.lower()

    for category, keywords in categories.items():
        for word in keywords:
            if word in text_lower:
                return category

    return "Technical"