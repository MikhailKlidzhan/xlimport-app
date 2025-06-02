$(document).ready(function () {
  console.log("! main.js loaded");
  let albumsList = [];

  const uploadModal = new bootstrap.Modal("#uploadModal");

  // Show modal
  $("#upload-excel").click(function () {
    uploadModal.show();
  });

  // Handle file upload
  $("#submit-upload").click(function () {
    const fileInput = $("#excel-file")[0];
    const submitBtn = $(this);

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
      success: function (response) {
        console.log("AJAX Response:", response);
        $("#uploadModal").one("hidden.bs.modal", function () {
          if (response.status === "duplicate") {
            alert(response.message);
          } else {
            fetchAndDisplayData().then(() => {
              populateFilters(albumsList);
              renderTable(albumsList);
            });
            alert("Файл успешно загружен!");
          }
        });
        uploadModal.hide();
      },
      error: function (xhr) {
        try {
          const error = JSON.parse(xhr.responseText).error;
          alert("Ошибка " + error);
        } catch {
          alert("Произошла неизвестная ошибка!");
        }
      },
    });
  });

  function fetchAndDisplayData() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/get-albums/",
        type: "GET",
        success: function (data) {
          console.log("Raw Data Received:", data);

          if (data && data.length > 0) {
            renderTable(data);
            $("#data-table").removeClass("d-none");
            $("#empty-message").addClass("d-none");
          } else {
            $("#data-table").addClass("d-none");
            $("#empty-message").removeClass("d-none");
          }

          albumsList = data;
          resolve();
        },
        error: function () {
          alert("Ошибка при обработке данных!");
          reject();
        },
      });
    });
  }

  function normalize(str) {
    return str ? str.normalize("NFKC") : "";
  }

  function renderTable(data) {
    albumsList = data;

    const selectedCustomer = $("#filter-customer").val();
    const selectedSiteObject = $("#filter-site-object").val();
    const selectedDocType = $("#filter-doc-type").val();

    console.log("!!! Selected Filters:", {
      customer: selectedCustomer,
      siteObject: selectedSiteObject,
      docType: selectedDocType,
    });

    const filtered = albumsList.filter((album) => {
      const cleanCustomer = normalize(album.customer__name);
      const cleanSiteObject = normalize(album.site_object__name);
      const cleanDocType = normalize(album.get_documentation_type_display);

      const customerMatch =
        !selectedCustomer ||
        normalize(album.customer__name) === normalize(selectedCustomer);
      const siteObjectMatch =
        !selectedSiteObject ||
        normalize(album.site_object__name) === normalize(selectedSiteObject);
      const docTypeMatch =
        !selectedDocType ||
        normalize(album.get_documentation_type_display) ===
          normalize(selectedDocType);

      // 📝 Log every album and match result
      console.log("Filtering Album:", {
        customer: album.customer__name,
        cleanCustomer,
        selectedCustomer,
        customerMatch,
        siteObject: album.site_object__name,
        cleanSiteObject,
        selectedSiteObject,
        siteObjectMatch,
        docType: album.get_documentation_type_display,
        cleanDocType,
        selectedDocType,
        docTypeMatch,
        matchesAll: customerMatch && siteObjectMatch && docTypeMatch,
      });

      return customerMatch && siteObjectMatch && docTypeMatch;
    });

    const tableBody = $("#data-table tbody");
    tableBody.empty();

    let colspan = "7";

    if (filtered.length === 0) {
      tableBody.append(`
            <tr><td colspan=${colspan} class="text-center">Нет данных</td></tr>
        `);
      return;
    }

    filtered.forEach(function (album) {
      tableBody.append(`
            <tr>
                <td>${album.customer__name || "-"}</td>
                <td>${album.site_object__name || "-"}</td>
                <td>${album.get_documentation_type_display || "-"}</td>
                <td>${album.volume !== null ? album.volume : "-"}</td>
                <td>${album.name || "-"}</td>
                <td>${album.file_name || "-"}</td>
                <td>${album.inventory_number || "-"}</td>
            </tr>
        `);
    });
  }

  function populateFilters(data) {
    console.log("Populating filters with data:", data); //  Debug line
    const customerSelect = $("#filter-customer");
    const siteObjectSelect = $("#filter-site-object");
    const docTypeSelect = $("#filter-doc-type");

    // if (!data || data.length === 0) {
    //   alert("Нет данных для фильтрации");
    //   return;
    // }

    // Clear existing options except first
    customerSelect.find("option:not(:first)").remove();
    siteObjectSelect.find("option:not(:first)").remove();
    docTypeSelect.find("option:not(:first)").remove();

    // Get unique values safely
    const customers = [
      ...new Set(
        data.map((d) => d.customer__name).filter((name) => name && name !== "")
      ),
    ];
    const siteObjects = [
      ...new Set(data.map((d) => d.site_object__name).filter(Boolean)),
    ];
    const docTypes = [
      ...new Set(
        data.map((d) => d.get_documentation_type_display).filter(Boolean)
      ),
    ];

    // Populate selects
    customers.forEach((name) => {
      $("<option>").val(name).text(name).appendTo(customerSelect);
    });

    siteObjects.forEach((name) => {
      $("<option>").val(name).text(name).appendTo(siteObjectSelect);
    });

    docTypes.forEach((type) => {
      $("<option>").val(type).text(type).appendTo(docTypeSelect);
    });

    console.log("Dropdown options after population:", {
      customers: customerSelect
        .find("option")
        .map(function () {
          return $(this).val();
        })
        .get(),
      siteObjects: siteObjectSelect
        .find("option")
        .map(function () {
          return $(this).val();
        })
        .get(),
      docTypes: docTypeSelect
        .find("option")
        .map(function () {
          return $(this).val();
        })
        .get(),
    });
  }

  // Load data and populate filters on page load
  fetchAndDisplayData()
    .then(() => populateFilters(albumsList))
    .catch(() => alert("Не удалось загрузить данные для фильтров."));

  // Attach filter listeners
  $("#filter-customer, #filter-site-object, #filter-doc-type").on(
    "change",
    function () {
      $("#data-table tbody").html(
        '<tr><td colspan="7" class="text-center">Фильтрация...</td></tr>'
      );
      setTimeout(() => renderTable(albumsList), 100);
    }
  );
});
