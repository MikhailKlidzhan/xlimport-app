from django.shortcuts import render
from django.http import JsonResponse, HttpRequest
from django.core.serializers.json import DjangoJSONEncoder
from .models import Album, Customer, SiteObject
import math
import hashlib
import pandas as pd
import traceback


def index(request: HttpRequest):
    return render(request, "xlimportapp/index.html")


def get_albums(request: HttpRequest):
    try:
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
            doc_type = album["documentation_type"]
            if doc_type is not None:
                album["get_documentation_type_display"] = Album.DocumentationType(doc_type).label
            else:
                album["get_documentation_type_display"] = "Неизвестно"

            # replace Nan with None for correct 'null' in JSON
            if isinstance(album["volume"], float) and math.isnan(album["volume"]):
                album["volume"] = None

        return JsonResponse(albums_list, safe=False, encoder=DjangoJSONEncoder)
    
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)



# compute hash function

def compute_file_hash(file):
    hash_sha256 = hashlib.sha256()
    for chunk in file.chunks():
        hash_sha256.update(chunk)
    return hash_sha256.hexdigest()


def upload_excel(request: HttpRequest):

    if request.method == "POST" and request.FILES.get("excel-file"):
        try:
            print("Received file:", request.FILES["excel-file"].name)
            uploaded_file = request.FILES["excel-file"]

            # creating hash
            file_hash = compute_file_hash(uploaded_file)
            

            # check if hash exists
            if Album.objects.filter(file_hash=file_hash).exists():
                return JsonResponse({"status": "duplicate", "message": "Этот файл уже был загружен ранее!"})
            
            # if not duplicate
            uploaded_file.seek(0) # reset ponter in file

            df = pd.read_excel(uploaded_file)

            print("Column in Excel:", df.columns.tolist())
            print("First row:", df.iloc[0].to_dict())

            # remove whitespaces
            df.columns = [col.strip() for col in df.columns]
            print("Cleaned columns in Excel:", df.columns.tolist())



            column_mapping = {
                "Заказчик": "customer",
                "Объект": "site_object",
                "Вид документации": "documentation_type",
                "Объем": "volume",
                "Наименование": "name",
                "Название файла": "file_name",
            }

            df.rename(columns=column_mapping, inplace=True)

            # clean volume column
            df["volume_cleaned"] = (
                df["volume"]
                .str.replace(",", ".", regex=False)
                .str.replace(r"[^\d.-]", "", regex=True)
                .replace("", float("nan"))
                .astype(float)
            )

            for _, row in df.iterrows():
                customer, _ = Customer.objects.get_or_create(name=row["customer"])
                site_object, _ = SiteObject.objects.get_or_create(name=row["site_object"])

                doc_type_map = {
                    "КЖ": Album.DocumentationType.KJ,
                    "КМ": Album.DocumentationType.KM,
                    "АР": Album.DocumentationType.AR,
                }

                doc_type = doc_type_map.get(row["documentation_type"], Album.DocumentationType.KJ)

                Album.objects.create(
                    customer=customer,
                    site_object=site_object,
                    documentation_type=doc_type,
                    volume=row["volume_cleaned"],
                    name=row["name"],
                    file_name=row["file_name"],
                    file_hash=file_hash, # save hash
                )
                
            return JsonResponse({"status": "success",})
        
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"error": str(e)}, status=400)
        
    return JsonResponse({"error": "Invalid request"}, status=400)












