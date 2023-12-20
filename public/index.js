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
            shareLink.value = `${window.location.origin}/view/${data.shareableLink}`;

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
});
