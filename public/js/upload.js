const uploadSpeedBox = document.querySelector("#uploadSpeed");
const remainingTimeBox = document.querySelector("#remainingTime");

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
  const formattedSpeed = formatBytes(uploadSpeed) + "/s";
  uploadSpeedBox.innerText = `Upload Speed: ${formattedSpeed}`;
}

const updateRemainingTime = (progress) => {
  const currentTime = new Date().getTime();
  const uploaded = (fileSize * progress) / 100;
  const remainingSize = fileSize - uploaded;
  const elapsedTime = (currentTime - startTime) / 1000;
  const remainingTime = (elapsedTime / progress) * (1 - progress) || 0;
  const uploadSpeed = uploaded / elapsedTime;

  const remainingTimeSeconds = remainingSize / uploadSpeed;
  remainingTimeBox.innerText = `Remaining Time: ${formatTime(remainingTimeSeconds)}`;
}

Dropzone.options.uploadZone = {
  paramName: "uploadedFile",
  acceptedFiles: "video/*",
  maxFilesize: null,

  init: function () {
    this.on("sending", function (file, xhr, formData) {
      startTime = new Date().getTime();
      fileSize = file.size;
      elapsedTime = 0;
    });

    this.on("uploadprogress", function (file, progress) {
      updateUploadSpeed((fileSize * progress) / 100, new Date().getTime() - startTime);
      updateRemainingTime(progress);

    });

    this.on("success", function (file, response) {
      console.log("File upload successful:", file, response);
      uploadSpeedBox.innerHTML = "";
      remainingTimeBox.innerHTML = "";
    });

    this.on("error", function (file, errorMessage, xhr) {
      console.error("File upload error:", file, errorMessage, xhr);

      uploadSpeedBox.innerHTML = "";
      remainingTimeBox.innerHTML = "";
    });
  },
};
