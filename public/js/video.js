(function (window, videojs) {
  var player = (window.player = videojs("video"));
  player.httpSourceSelector();
})(window, window.videojs);
