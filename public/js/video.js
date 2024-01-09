document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("video");
  const source = video.getElementsByTagName("source")[0].src;
  const defaultOptions = {
    keyboard: {
      global: true,
    },
    tooltips: {
      controls: true,
    },
    fullscreen: {
      enabled: true,
      fallback: true,
      iosNative: true,
      container: null,
    },
    controls: [
      "play-large", // The large play button in the center
      "restart", // Restart playback
      "rewind", // Rewind by the seek time (default 10 seconds)
      "play", // Play/pause playback
      "fast-forward", // Fast forward by the seek time (default 10 seconds)
      "progress", // The progress bar and scrubber for playback and buffering
      "current-time", // The current time of playback
      "duration", // The full duration of the media
      "mute", // Toggle mute
      "volume", // Volume control
      "captions", // Toggle captions
      "settings", // Settings menu
      "pip", // Picture-in-picture (currently Safari only)
      "airplay", // Airplay (currently Safari only)
      //'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
      "fullscreen", // Toggle fullscreen
    ],
  };

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(source);

    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
      const availableQualities = hls.levels.map((l) => l.height);
      availableQualities.unshift(0);

      defaultOptions.quality = {
        default: 0, //Default - AUTO
        options: availableQualities,
        forced: true,
        onChange: (e) => updateQuality(e),
      };

      defaultOptions.i18n = {
        qualityLabel: {
          0: "Auto",
        },
      };

      hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
        var span = document.querySelector(".plyr__menu__container [data-plyr='quality'][value='0'] span");
        if (hls.autoLevelEnabled) {
          span.innerHTML = `Auto (${hls.levels[data.level].height}p)`;
        } else {
          span.innerHTML = `Auto`;
        }
      });

      // Initialize here
      new Plyr(video, defaultOptions);
    });

    

    hls.attachMedia(video);
    window.hls = hls;
  } else {
    // default options with no quality update in case Hls is not supported
    new Plyr(video, defaultOptions);
  }

  function updateQuality(newQuality) {
    if (newQuality === 0) {
      window.hls.currentLevel = -1; //Enable AUTO quality if option.value = 0
    } else {
      window.hls.levels.forEach((level, levelIndex) => {
        if (level.height === newQuality) {
          console.log("Found quality match with " + newQuality);
          window.hls.currentLevel = levelIndex;
        }
      });
    }
  }
});
