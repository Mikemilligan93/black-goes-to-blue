// Sound effects and music from the audio/ folder (MP3 first, then OGG).
// A missing file simply plays nothing, so the game never breaks without audio.
window.Sound = (function () {
  var cache = {}, muted = false, current = null, currentName = null;
  function load(name) {
    if (name in cache) return cache[name];
    var a = new Audio(); a.preload = 'auto'; cache[name] = a;
    a.onerror = function () {
      if (a.src.slice(-4) === '.mp3') a.src = 'audio/' + name + '.ogg';
      else cache[name] = null;
    };
    a.src = 'audio/' + name + '.mp3';
    return a;
  }
  return {
    preload: function (names) { names.forEach(load); },
    play: function (name, volume) {
      var a = load(name); if (!a || muted || !a.readyState) return;
      var c = a.cloneNode(); c.volume = volume === undefined ? 0.7 : volume;
      c.play().catch(function () {});
    },
    music: function (name) {
      if (currentName === name) return;
      if (current) current.pause();
      currentName = name; current = name ? load(name) : null;
      if (!current) return;
      current.loop = true; current.volume = 0.45; current.currentTime = 0;
      if (!muted) current.play().catch(function () {});
    },
    resume: function () { if (current && !muted && current.paused) current.play().catch(function () {}); },
    toggleMute: function () {
      muted = !muted;
      if (current) { if (muted) current.pause(); else current.play().catch(function () {}); }
      return muted;
    },
  };
})();
