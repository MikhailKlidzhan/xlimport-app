from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from .models import Album, Customer, SiteObject
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

def upload_excel(request: HttpRequest):

    if request.method == "POST" and request.FILES.get("excel_file"):
        try:
            df = pd.read_excel(request.FILES["excel_file"])

            for _, row in df.iterrows():
                customer, _ = Customer.objects.get_or_create(name=row["Заказчик"])
                site_object, _ = SiteObject.objects.get_or_create(name=row["Объект"])

                Album.objects.create(
                    customer=customer,
                    site_object=site_object,
                    documentation_type=row["Вид документации"],
                    volume=row["Объем"],
                    name=row["Наименование"],
                    file_name=row["Название файла"],
                )

            return JsonResponse({"status": "success",})
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
    return JsonResponse({"error": "Invalid request"}, status=400)












