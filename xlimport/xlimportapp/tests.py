from django.test import TestCase
from .models import Customer, SiteObject, Album
from django.core.exceptions import ValidationError

class AlbumModelTest(TestCase):
    def setUp(self):
        print("\n---Setting up a testcase for AlbumModel---")
        self.customer = Customer.objects.create(name="Тестовый заказчик")
        self.site_object = SiteObject.objects.create(name="Тестовый объект")
        print(f"\n---Created testcustomer: {self.customer.name}, and testobject: {self.site_object}---")

    def test_inventory_number_extraction(self):
        # test case 1, with correct file_name
        album = Album(
            customer=self.customer,
            site_object=self.site_object,
            name="Тестовый альбом",
            file_name="Project_M-123456_blueprints.pdf",
            volume=10.5
        )
        album.save()
        print(f"\n---Created a testalbum1 with:\nCustomer {album.customer.name},\nSite_object {album.site_object},\nName {album.name},\nFile_name {album.file_name},\nVolume {album.volume},\nInventory_number {album.inventory_number}")
        self.assertEqual(album.inventory_number, "M-123456")

        # test case 2, with incorrect file_name, using fallback
        album2 = Album(
            customer=self.customer,
            site_object=self.site_object,
            name="Альбом без номера",
            file_name="Project_docs.pdf",
            volume=5.2
        )
        album2.save()
        print(f"\n---Created a testalbum2 with:\nCustomer {album2.customer.name},\nSite_object {album2.site_object},\nName {album2.name},\nFile_name {album2.file_name},\nVolume {album2.volume},\nFallback inventory_number {album2.inventory_number}")
        self.assertEqual(album2.inventory_number, "M-000000")

    def test_required_fields(self):
        # raising error when fields are missing
        print("\n---Starting required field test---")
        print("---Creating Album without file_name---")

        try:
            album = Album(
                customer=self.customer,
                site_object=self.site_object,
                name="Неполный альбом",
                volume=10.5,
            )
            print("\nAlbum object created, but not validated yet!")

            print("Attempting full_clean()...")
            album.full_clean()
            print("THIS MUSTN'T PRINT -- unexpected validation")
        
        except ValidationError as e:
            print(f"Caught expected ValidationError: {e}")
            print("Error details:")
            for field, errors in e.error_dict.items():
                print(f"    {field}: {errors}")
            

        print("\n---Test completed successfully!---")
