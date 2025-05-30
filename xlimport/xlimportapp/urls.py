from django.urls import path
from .views import ImportIndexView, UploadExcelTableView

app_name = "xlimportapp"

urlpatterns = [
    path("", ImportIndexView.as_view(), name="index"),
    path("upload/", UploadExcelTableView.as_view(), name="upload")
]
