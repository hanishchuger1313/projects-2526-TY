



# from django.contrib import admin
# from .models import Folder, Document


# class DocumentInline(admin.TabularInline):
#     model = Document
#     extra = 0


# @admin.register(Folder)
# class FolderAdmin(admin.ModelAdmin):
#     list_display = ("name", "uploaded_at")
#     inlines = [DocumentInline]


# @admin.register(Document)
# class DocumentAdmin(admin.ModelAdmin):
#     list_display = (
#         "file_name",
#         "predicted_category",
#         "keywords",
#         "uploaded_at"
#     )
#     list_filter = ("predicted_category",)
#     search_fields = ("file_name", "keywords")


from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "file_name",
        "predicted_category",
        "keywords",
        "uploaded_at"
    )
    list_filter = ("predicted_category",)
    search_fields = ("file_name", "keywords")