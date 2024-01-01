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
  const remainingTime = (elapsedTime / progress) * (1 - progress) || 0;
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

      //document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
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
      console.log("canceled");

      const element = file.previewElement;

      element.querySelector("#status").innerText = "Error..";
    });

    this.on("success", function (file) {
      const element = file.previewElement;

      element.querySelector("#status").innerText = "Converting...";

      element.querySelector("#fileSize").parentNode.style.display = "none";
      element.querySelector("#uploadSpeed").parentNode.style.display = "none";
      element.querySelector("#remainingTime").parentNode.style.display = "none";

      const conversionContainer = element.querySelector(".conversionContainer");
      conversionContainer.style.display = "block";

      const checkBoxes = conversionContainer.querySelectorAll(".stage-checkbox");

      element.querySelector("#total-progress").style.display = "none";

      const response = JSON.parse(file.xhr.response);

      fetch(`/convert/${response.id}`)
        .then((response) => {
          const reader = response.body.getReader();

          const processStream = ({ done, value }) => {
            if (done) {
              console.log("Done");

              element.querySelector("#status").innerText = "Done";
              return;
            }

            const decoder = new TextDecoder();
            const chunk = decoder.decode(value, { stream: true });

            try {
              const data = JSON.parse(chunk);

              if (data) {
                const { format, status } = data;

                checkBoxes.forEach((box) => {
                  if (box.id === format) {
                    if (data.status === "finish") {
                      box.classList.add("stage-done");
                      box.innerText = "✓";
                      box.parentNode.querySelector("#convert_progress").parentNode.style.display = "none";
                    } else if (box.status === "error") {
                      box.classList.add("stage-error");
                      box.innerText = "x";
                      box.parentNode.querySelector("#convert_progress").parentNode.style.display = "none";
                    } else {
                      box.parentNode.querySelector("#convert_progress").style.width = `${status}%`;
                    }
                  }
                });
              }
              console.log(data);
            } catch (error) {
              console.log(error);
            }

            reader.read().then(processStream);
          };

          reader.read().then(processStream);
        })
        .catch((error) => {
          console.log(chunk);
          console.error("Error fetching count:", error);
        });
    });

    // Hide the total progress bar when nothing's uploading anymore
    this.on("queuecomplete", function (progress) {});
  },
};

previewNode.parentNode.removeChild(previewNode);
