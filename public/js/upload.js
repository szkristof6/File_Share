window.onbeforeunload = function () {
  return "";
};

// Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
var previewNode = document.querySelector("#template");
previewNode.id = "";
var previewTemplate = previewNode.parentNode.innerHTML;

let startTime;
let fileSize = 0;
let elapsedTime = 0;

// Function to format bytes to appropriate units
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatTime(seconds) {
  if (seconds < 10) {
    return "Under 10 sec.";
  } else if (seconds < 60) {
    return Math.round(seconds / 5) * 5 + " sec.";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let timeString = "";
  if (hours > 0) {
    timeString += hours + " hour";
    if (hours > 1) timeString += "s";
    if (minutes > 0) timeString += " ";
  }
  if (minutes > 0) {
    timeString += minutes + " min";
  }

  return timeString;
}

const updateUploadSpeed = (size, time) => {
  const uploadSpeed = size / (time / 1000);
  return formatBytes(uploadSpeed) + "/s";
};

const updateRemainingTime = (progress) => {
  const currentTime = new Date().getTime();
  const uploaded = (fileSize * progress) / 100;
  const remainingSize = fileSize - uploaded;
  const elapsedTime = (currentTime - startTime) / 1000;
  const uploadSpeed = uploaded / elapsedTime;

  const remainingTimeSeconds = remainingSize / uploadSpeed;

  return formatTime(remainingTimeSeconds);
};

Dropzone.options.uploadZone = {
  // Make the whole body a dropzone
  previewTemplate: previewTemplate,
  previewsContainer: "#previews", // Define the container to display the previews

  paramName: "uploadedFile",
  acceptedFiles: "video/*",
  maxFilesize: null,

  createImageThumbnails: false,
  dictDefaultMessage: "Drop files here to upload",

  init: function () {
    this.on("sending", function (file, xhr, formData) {
      const element = file.previewElement;

      element.style.display = "block";

      startTime = new Date().getTime();
      fileSize = file.size;
      elapsedTime = 0;
    });

    this.on("uploadprogress", function (file, progress, bytesSent) {
      const element = file.previewElement;

      const uploadSpeedContainer = element.querySelector("#uploadSpeed");
      const remainingTimeContainer = element.querySelector("#remainingTime");

      uploadSpeedContainer.innerText = updateUploadSpeed((fileSize * progress) / 100, new Date().getTime() - startTime);
      remainingTimeContainer.innerText = updateRemainingTime(progress);
    });

    this.on("sending", function (file) {
      // Show the total progress bar when upload starts
      const element = file.previewElement;

      element.querySelector("#total-progress").style.opacity = "1";
    });

    this.on("canceled", function (file) {
      console.log("canceled");
    });

    this.on("error", function (file) {
      const element = file.previewElement;

      element.querySelector("#status").innerText = "Error..";
    });

    this.on("success", function (file) {
      const element = file.previewElement;

      element.querySelector("#status").innerText = "Converting...";

      element.querySelector("#fileSize").parentNode.style.display = "none";
      element.querySelector("#uploadSpeed").parentNode.style.display = "none";
      element.querySelector("#remainingTime").parentNode.style.display = "none";

      element.querySelector(".progress-bar").classList.add("bg-warning");

      const response = JSON.parse(file.xhr.response);

      fetch(`/convert/${response.id}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "error") {
            console.error(data.message);
            element.querySelector("#status").innerText = "Error..";
          } else if (data.status === "success") {
            element.querySelector(".progress-bar").parentNode.remove();

            element.querySelector("#status").innerText = "Done";
          }
        });
    });

    // Hide the total progress bar when nothing's uploading anymore
    this.on("queuecomplete", function (progress) {});
  },
};

previewNode.parentNode.removeChild(previewNode);
