$(document).ready(function() {
    // initiate albumList for filters
    let albumsList = [];

    const uploadModal = new bootstrap.Modal("#uploadModal");

    // show modal
    $("#upload-excel").click(function(){
        uploadModal.show();
    });

    // show data table
    $("#show-data").click(function(){
        fetchAndDisplayData();
    });

    // handle file upload
    $("#submit-upload").click(function(){
        const fileInput = $("#excel-file")[0];
        const submitBtn = $(this);

        if (fileInput.files.length === 0) {
            alert("Пожалуйста, сначала выберите файл!");
            return;
        }

        submitBtn.prop("disabled", true).text("Загрузка...");

        const formData = new FormData($("#upload-form")[0]);
        formData.append("excel-file", fileInput.files[0]);

        $.ajax({
            url: "/upload/",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("AJAX Response:", response); 

                $("#uploadModal").one("hidden.bs.modal", function(){
                    if (response.status === "duplicate") {
                        alert(response.message);
                    } else {
                        fetchAndDisplayData();
                        alert("Файл успешно загружен!");
                    }
                    $("#upload-excel").trigger("focus");
                    });

                uploadModal.hide();
                $("#upload-form")[0].reset();
                submitBtn.prop("disabled", false).text("Upload");
                
            },
            error: function(xhr) {
                try {
                    const error = JSON.parse(xhr.responseText).error;
                    alert("Ошибка " + error)
                } catch {
                    alert("Произошла неизвестная ошибка!");
                }

            }
        });


    });

    function fetchAndDisplayData() {
        $.ajax({
            url: "/get-albums/",
            type: "GET",
            success: function(data) {
                if (data.length > 0) {
                    renderTable(data);
                    $("#data-table").removeClass("d-none");
                    $("#empty-message").addClass("d-none");

                } else {
                    $("#data-table").addClass("d-none");
                    $("#empty-message").removeClass("d-none");
                }
            },
            error: function() {
                alert("Ошибка при обработке данных!");
            }
        });
    }

    function renderTable(data) {
        // ful list for filtering
        albumsList = data;

        // getting current filter values
        const selectedCustomer = $("#filter-customer").val();
        const selectedSiteObject = $("#filter-site-object").val();
        const selectedDocType = $("#filter-doc-type").val();

        // applying filters
        const filtered = albumsList.filter(album => {
            return (
                (!selectedCustomer || album.customer__name === selectedCustomer) &&
                (!selectedSiteObject || album.site_object__name === selectedSiteObject) &&
                (!selectedDocType || album.get_documentation_type_display === selectedDocType)
            );
        });



        const tableBody = $("#data-table tbody");
        tableBody.empty();

        data.forEach(function(album) {
            tableBody.append(`
                <tr>
                    <td>${album.customer__name}</td>
                    <td>${album.site_object__name}</td>
                    <td>${album.get_documentation_type_display}</td>
                    <td>${album.volume !== null ? album.volume : "-"}</td>
                    <td>${album.name}</td>
                    <td>${album.file_name}</td>
                    <td>${album.inventory_number}</td>
                </tr>
                `);
        });
    }

    

    // populate filters for customer, site_object, doc_type
    function populateFilters(data) {
        const customerSelect = $("#filter-customer");
        const siteObjectSelect = $("#filter-site-object");

        const customers = [...new Set(data.map(d => d.customer__name))];
        const siteObjects = [...new Set(data.map(d => d.site_object__name))];

        customers.forEach(name => {
            customerSelect.append(`<option value="${name}">${name}</option>`);
        });

        siteObjects.forEach(name => {
            siteObjectSelect.append(`<option value="${name}">${name}</option>`);
    });
}

// load data on page load
    fetchAndDisplayData().then(() => {
        populateFilters(albumList);
    });



});