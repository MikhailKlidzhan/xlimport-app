from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from .models import Album
import pandas as pd


def index(request: HttpRequest):
    return render(request, "index.html")


def get_albums(request: HttpRequest):

    albums = Album.objects.all().values(
        "customer__name",
        "site_object__name",
        "documentation_type",
        "volume",
        "name",
        "file_name",
    )

    albums_list = list(albums)
    for album in albums_list:
        album["get_documentation_type_display"] = Album.DocumentationType(album["documentation_type"]).label

    return JsonResponse(albums_list, safe=False)














