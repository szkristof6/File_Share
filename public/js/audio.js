audio.on("play", function () {
  requestAnimationFrame(updateSeek);
});

audio.on("end", function () {
  playIcon.style.display = "inline-block";
  pauseIcon.style.display = "none";
});

const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const seekSlider = document.getElementById("seek");
const volumeSlider = document.getElementById("volume");
var muteBtn = document.getElementById("muteBtn");
var soundIcon = document.querySelector("#muteBtn img");
const timeDisplay = document.getElementById("timeDisplay");

playPauseBtn.addEventListener("click", function () {
  if (audio.playing()) {
    audio.pause();
  } else {
    audio.play();
  }
});

muteBtn.addEventListener("click", function () {
  if (audio.volume() === 0) {
    audio.volume(0.5); // Set volume to half when unmuted
    soundIcon.src = "/images/icons/sound-icon.png"; // Change icon to unmute icon
  } else {
    audio.volume(0); // Mute the audio
    soundIcon.src = "/images/icons/mute-icon.png"; // Change icon to mute icon
  }
});

volumeSlider.addEventListener("input", function () {
  var volume = volumeSlider.value / 100;

  if (volume === 0) {
    soundIcon.src = "/images/icons/mute-icon.png"; // Change icon to mute icon
  } else {
    soundIcon.src = "/images/icons/sound-icon.png"; // Change icon to unmute icon
  }

  audio.volume(volume);
});

seekSlider.addEventListener("input", function () {
  audio.seek(seekSlider.value);
  updateTimeDisplay(seekSlider.value);
});

function updateSeek() {
  var seekPosition = audio.seek();
  seekSlider.value = seekPosition || 0;
  updateTimeDisplay(seekPosition);
  requestAnimationFrame(updateSeek);
}

function updateTimeDisplay(seekPosition) {
  var duration = audio.duration();
  var minutes = Math.floor(seekPosition / 60);
  var seconds = Math.floor(seekPosition % 60);
  var formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  var durationMinutes = Math.floor(duration / 60);
  var durationSeconds = Math.floor(duration % 60);
  var formattedDuration = (durationMinutes < 10 ? "0" : "") + durationMinutes + ":" + (durationSeconds < 10 ? "0" : "") + durationSeconds;

  timeDisplay.textContent = formattedTime + " / " + formattedDuration;
}
