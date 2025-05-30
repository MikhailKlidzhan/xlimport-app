from django.urls import path
from .views import index, get_albums, upload_excel

app_name = "xlimportapp"

urlpatterns = [
    path("", index, name="index"),
    path("get-albums/", get_albums, name="get_albums"),
    path("upload/", upload_excel, name="upload_excel"),
]
