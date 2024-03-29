const urlSearchParams = new URLSearchParams(window.location.search);
const queryParams = Object.fromEntries(urlSearchParams.entries());

const loader = document.querySelector(".skeleton-loader");

function hideLoader() {
  loader.classList.remove("show");
}

function showLoader() {
  if (tableParent.querySelector("table")) tableParent.querySelector("table").remove();

  loader.classList.add("show");
}

async function getData(queryParams) {
  return fetch(`/search/get?${new URLSearchParams(queryParams).toString()}`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error deleting file");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function createArrowIndicator(parent, dir = "asc") {
  const arrowImage = document.createElement("img");
  arrowImage.src = `/images/icons/arrow-${dir}.svg`;
  arrowImage.alt = dir;
  arrowImage.classList.add("arrow", dir);

  parent.appendChild(arrowImage);
}

function newSortDirection(button, current) {
  if (current === button.querySelector("img")) {
    return current.classList.contains("asc") ? "desc" : "asc";
  }
  return "asc";
}

function updateArrowIndicator(button, isAscending) {
  button.classList.toggle("asc");
  button.classList.toggle("desc");

  button.src = isAscending ? "/images/icons/arrow-asc.svg" : "/images/icons/arrow-desc.svg";
}

function getUpdatedData() {
  const nextURL = `${window.location.origin}/search?${new URLSearchParams(queryParams).toString()}`;
  window.history.pushState({}, null, nextURL);

  getData(queryParams).then((data) => displayData(data));
}

function displayTableHeder(parent) {
  const columnNames = [
    { name: "Name", sortable: true },
    { name: "Size", sortable: true },
    { name: "Views", sortable: true },
    { name: "Actions", sortable: false },
  ];

  const thead = document.createElement("thead");
  const theadTr = document.createElement("tr");

  columnNames.forEach((columnName) => {
    const nameTh = document.createElement("th");
    nameTh.scope = "col";
    if (columnName.sortable) nameTh.id = "sortable";

    nameTh.innerText = columnName.name;
    if (queryParams.sort) {
      if (queryParams.sort.toLowerCase().trim() === columnName.name.toLowerCase()) {
        createArrowIndicator(nameTh, queryParams.dir);

        //<img src="/images/icons/arrow-<%= sort.dir %>.svg" alt="<%= sort.dir %>" class="arrow <%= sort.dir %>" />
      }
    } else {
      if (columnName.name == "Name") {
        createArrowIndicator(nameTh);
      }
    }

    // Sort table
    nameTh.addEventListener("click", () => {
      const currentSort = document.querySelector("img.arrow");

      if (columnName.sortable) {
        queryParams.sort = columnName.name.toLowerCase();
        queryParams.dir = newSortDirection(nameTh, currentSort);

        if (currentSort === nameTh.querySelector("img")) {
          const sortDir = currentSort.classList.contains("asc");

          updateArrowIndicator(currentSort, !sortDir);
        } else {
          currentSort.remove();

          createArrowIndicator(nameTh);
        }

        getUpdatedData();

        //window.location.href = `${window.location.origin}/search?${new URLSearchParams(queryParams).toString()}`;
      }
    });

    isHeaderDisplayed = true;

    theadTr.appendChild(nameTh);
  });

  thead.appendChild(theadTr);
  parent.appendChild(thead);
}

function displayNoFiles(parent) {
  const noFilesDiv = document.createElement("div");
  noFilesDiv.id = "no-files";
  noFilesDiv.innerText = "No files found.";

  parent.appendChild(noFilesDiv);
}

function displaySpinner(parent) {
  const spinner = document.createElement("div");
  spinner.className = "spinner-border text-light";
  spinner.setAttribute("role", "status");

  parent.replaceChild(spinner, parent.childNodes[0]);

  return spinner;
}

function createRemoveButton(parent, file) {
  const modal = new bootstrap.Modal(document.getElementById("removeFileModal"));

  const removeButton = document.createElement("button");
  removeButton.classList.add("btn", "btn-danger", "delete-btn");
  removeButton.innerText = "Remove";

  removeButton.style.marginRight = "5px";

  removeButton.addEventListener("click", () => {
    modal.show();

    const confirmButton = document.getElementById("confirmRemove");
    confirmButton.addEventListener("click", () => {
      const spinner = displaySpinner(removeButton);

      modal.hide();

      fetch(`/delete/${file.id}`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            removeButton.removeChild(spinner);

            removeButton.parentElement.parentElement.remove();

            const elements = document.querySelectorAll("tr");
            if(elements.length - 1 === 0){
              document.querySelector("thead").remove();
              const parent = document.querySelector("tbody");
              displayNoFiles(parent);
            }

          } else {
            throw new Error("Error deleting file");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while deleting the file");
        });
    });
  });

  parent.appendChild(removeButton);
}

function createCopyLinkField(url, linkElement) {
  linkElement.value = `${window.location.origin}/${url}`;

  const copyButton = document.getElementById("copyToClipboard");
  if (copyButton.classList.contains("btn-success")) {
    copyButton.classList.remove("btn-success");
    copyButton.classList.add("btn-info");
    copyButton.innerText = "Copy to clipboard";
  }

  copyButton.addEventListener("click", () => {
    // Select the text field
    linkElement.select();
    linkElement.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(linkElement.value);

    copyButton.innerText = "Copied to clipboard";
    copyButton.classList.remove("btn-info");
    copyButton.classList.add("btn-success");
  });
}

function createNameWithLink(parent, url, name) {
  const shareLink = document.createElement("a");
  shareLink.href = url;
  shareLink.target = "_blank";
  shareLink.innerText = name;

  parent.appendChild(shareLink);
}

function displayData(data) {
  const { files } = data;

  showLoader();

  const tableParent = document.querySelector("#tableParent");

  if (tableParent.querySelector("table")) tableParent.querySelector("table").remove();

  const table = document.createElement("table");
  table.classList.add("table", "table-striped");
  table.id = "data-table";

  if (files.length === 0) {
    const tbody = document.createElement("tbody");

    displayNoFiles(tbody);

    table.appendChild(tbody);
    tableParent.appendChild(table);

    hideLoader();
  } else {
    displayTableHeder(table);

    const tbody = document.createElement("tbody");
    files.forEach((file) => {
      const dataTr = document.createElement("tr");

      const rowElements = [file.name, file.size, file.views, null];

      rowElements.forEach((element) => {
        const td = document.createElement("td");

        if (element === file.name) {
          if (file.converted) {
            createNameWithLink(td, file.link, element);
          } else {
            td.innerText = element;
          }
        } else if (element === null) {
          if (file.converted) {
            createRemoveButton(td, file);
          } else {
            td.innerText = "Converting..";
          }
        } else {
          td.innerText = element;
        }
        dataTr.appendChild(td);
      });
      tbody.appendChild(dataTr);
    });

    table.appendChild(tbody);
    tableParent.appendChild(table);

    hideLoader();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getData(queryParams).then((data) => displayData(data));

  // Search functionality
  document.getElementById("searchInput").addEventListener("input", function () {
    queryParams.search = this.value.toUpperCase();

    getUpdatedData();
  });
});
