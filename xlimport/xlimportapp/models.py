from django.db import models
import re

class Customer(models.Model):
    name = models.CharField("Наименование", max_length=200, unique=True)

    class Meta:
        verbose_name = "Заказчик"
        verbose_name_plural = "Заказчики"
    
    def __str__(self):
        return self.name


class SiteObject(models.Model):
    name = models.CharField("Наименование", max_length=200)

    class Meta:
        verbose_name = "Объект"
        verbose_name_plural = "Объекты"

    def __str__(self):
        return self.name
    




class Album(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, verbose_name="Заказчик")
    site_object = models.ForeignKey(SiteObject, on_delete=models.PROTECT, verbose_name="Объект")
    name = models.TextField("Наименование")

    class Meta:
        verbose_name = "Альбом"
        verbose_name_plural = "Альбомы"
        ordering = ["-created_at"]

    class DocumentationType(models.IntegerChoices):
        KJ = 1, "КЖ"
        KM = 2, "КМ"
        AR = 3, "АР"
    
    documentation_type = models.IntegerField(
        "Вид документации",
        choices=DocumentationType.choices,
        default=DocumentationType.KJ,
    )

    volume = models.FloatField("Объем")
    file_name = models.CharField("Название файла", max_length=200)
    inventory_number = models.CharField("Инвентарный номер", max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.inventory_number and self.file_name:
            # More robust extraction with fallback
            match = re.search(r'M-\d{6}', self.file_name)
            if match:
                self.inventory_number = match.group()
            else:
                # Fallback: Generate default if pattern not found
                self.inventory_number = "M-000000"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name




