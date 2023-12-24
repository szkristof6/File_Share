document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const fileId = button.getAttribute("data-file-id");

      const modal = new bootstrap.Modal(document.getElementById("removeFileModal"));
      modal.show();

      const confirmButton = document.getElementById("confirmRemove");
      confirmButton.onclick = function () {
        const spinner = document.createElement("div");
        spinner.className = "spinner-border text-light";
        spinner.setAttribute("role", "status");

        button.replaceChild(spinner, button.childNodes[0]);

        modal.hide();

        fetch(`/delete/${fileId}`, {
          method: "POST",
        })
          .then((response) => {
            if (response.ok) {
              button.removeChild(spinner);
              button.parentElement.parentElement.remove();
            } else {
              throw new Error("Error deleting file");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while deleting the file");
          });
      };
    });
  });

  const shareButtons = document.querySelectorAll(".share-btn");
  const shareLink = document.getElementById("shareLink");

  shareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const fileId = button.getAttribute("data-file-id");
      const isShared = button.innerText === "Remove Share";

      const spinner = document.createElement("div");
      spinner.className = "spinner-border text-light";
      spinner.setAttribute("role", "status");

      button.replaceChild(spinner, button.childNodes[0]);

      if (!isShared) {
        fetch(`/share/${fileId}`, {
          method: "POST",
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Error sharing file");
            }
          })
          .then((data) => {
            shareLink.value = `${window.location.origin}/${data.shareableLink}`;

            button.removeChild(spinner);

            button.innerText = "Remove Share";

            button.classList.toggle("btn-primary");
            button.classList.toggle("btn-warning");

            const modal = new bootstrap.Modal(document.getElementById("shareFileModal"));

            const copyButton = document.getElementById("copyToClipboard");
            copyButton.addEventListener("click", () => {
              const shareLink = document.getElementById("shareLink");
              shareLink.select();
              document.execCommand("copy");

              copyButton.innerText = "Copied to clipboard";
              copyButton.classList.remove("btn-info");
              copyButton.classList.add("btn-success");
            });

            modal.show();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while sharing the file");
          });
      } else {
        // Perform remove share logic (change button text back to "Share")
        fetch(`/removeShare/${fileId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              button.removeChild(spinner);

              button.innerText = "Share";

              button.classList.toggle("btn-primary");
              button.classList.toggle("btn-warning");
            } else {
              throw new Error("Error removing share");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while removing the share");
          });
      }
    });
  });

  // JavaScript for sorting the table

  function newSortDirection(button, current) {
    if (current === button.querySelector("img")) {
      return current.classList.contains("asc") ? "desc" : "asc";
    }
    return "asc";
  }

  const sortButtons = document.querySelectorAll("thead th#sortable");
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentSort = document.querySelector("img.arrow");

      const textContent = button.innerText.toLowerCase().trim();
      const sortable = ["name", "size", "type", "views"];

      if (sortable.includes(textContent)) {
        const query = {
          sort: textContent,
          dir: newSortDirection(button, currentSort),
        };

        if (currentSort === button.querySelector("img")) {
          const sortDir = currentSort.classList.contains("asc");

          updateArrowIndicator(currentSort, !sortDir);
        } else {
          currentSort.remove();

          createArrowIndicator(button);
        }

        window.location.href = `${window.location.origin}/search?${new URLSearchParams(query).toString()}`;
      }
    });
  });

  function updateArrowIndicator(button, isAscending) {
    button.classList.toggle("asc");
    button.classList.toggle("desc");

    button.src = isAscending ? "/images/icons/arrow-asc.svg" : "/images/icons/arrow-desc.svg";
  }

  function createArrowIndicator(parent) {
    const image = document.createElement("img");
    image.classList.add("arrow");
    image.classList.add("asc");

    image.src = "/images/icons/arrow-asc.svg";

    parent.appendChild(image);
  }

  // Search functionality
  document.getElementById("searchInput").addEventListener("input", function () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlSearchParams.entries());

    queryParams.search = this.value.toUpperCase();

    window.location.href = `${window.location.origin}/search?${new URLSearchParams(queryParams).toString()}`;
  });
});
