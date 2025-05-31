$(document).ready(function() {
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
        if (fileInput.files.length === 0) {
            alert("Пожалуйста, сначала выберите файл!");
            return;
        }

        const formData = new FormData($("#upload-form")[0]);
        formData.append("excel-file", fileInput.files[0]);

        $.ajax({
            url: "/upload/",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                uploadModal.hide();
                $("#upload-form")[0].reset();
                fetchAndDisplayData();
                alert("Файл успешно загружен!");
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
                </tr>
                `);
        });
    }

    // load data on page load
    fetchAndDisplayData();





});