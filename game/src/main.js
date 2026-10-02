// Entry point. For now: a scaled canvas showing the title from texts.js.
(function () {
  if (!window.checkDataFiles()) return;
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var W = CONFIG.width, H = CONFIG.height;

  // Scale the canvas to fit the window, keeping 16:9.
  function fit() {
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  // F toggles fullscreen (for the projector).
  window.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  function draw(t) {
    ctx.fillStyle = '#d8d4cc';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.font = '84px "Bungee Shade", serif';
    ctx.fillText(TEXT.GAME_TITLE, W / 2, H / 2 - 20);
    if (Math.floor(t / 600) % 2 === 0) {
      ctx.font = '32px "Playfair Display", serif';
      ctx.fillText(TEXT.PRESS_START, W / 2, H / 2 + 60);
    }
    requestAnimationFrame(draw);
  }
  document.fonts.ready.then(function () { requestAnimationFrame(draw); });
})();
