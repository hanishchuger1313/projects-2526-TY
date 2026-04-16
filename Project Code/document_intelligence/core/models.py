

# from django.db import models


# class Document(models.Model):

#     CATEGORY_CHOICES = [
#         ("Sports", "Sports"),
#         ("Technical", "Technical"),
#         ("Education", "Education"),
#         ("Politics", "Politics"),
#         ("Legal", "Legal"),
#         ("Entertainment", "Entertainment"),
#     ]

#     file_name = models.CharField(max_length=255)
#     predicted_category = models.CharField(
#         max_length=100,
#         choices=CATEGORY_CHOICES
#     )
#     keywords = models.TextField(blank=True)
#     uploaded_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.file_name} - {self.predicted_category}"




from django.db import models


class Document(models.Model):

    CATEGORY_CHOICES = [
        ("Sports", "Sports"),
        ("Technology", "Technology"),
        ("Education", "Education"),
        ("Politics", "Politics"),
        ("Legal", "Legal"),
        ("Entertainment", "Entertainment"),
        ("Healthcare", "Healthcare"),
        ("Business", "Business"),
        ("National", "National"),
        ("International", "International"),
        ("Other", "Other"),
    ]

    file_name = models.CharField(max_length=255)

    predicted_category = models.CharField(
        max_length=100,
        choices=CATEGORY_CHOICES,
        default="Other"
    )

    keywords = models.TextField(
        blank=True,
        help_text="Top extracted keywords from document"
    )

    confidence_score = models.FloatField(
        default=0.0,
        help_text="Prediction confidence percentage"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Document"
        verbose_name_plural = "Documents"

    def __str__(self):
        return f"{self.file_name} | {self.predicted_category} ({self.confidence_score}%)"