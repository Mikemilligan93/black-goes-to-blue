// ============================================================
//  PAINTED ART with colour return.
//  Each painted image (Nano Banana) is pre-split by tools/build_art.py into a
//  grey version and one layer per colour group. We draw the grey version,
//  then each colour layer with opacity = how much of that colour is restored.
// ============================================================
window.Art = window.Art || {};

(function () {
  var cache = {};
  Art.levelsOverride = null; // set to an object to draw with other colour levels (e.g. a preview)

  Art.loadPainted = function (names, done) {
    var left = 0;
    names.forEach(function (n) {
      var m = window.ART_MANIFEST && ART_MANIFEST[n];
      if (!m) { console.warn('No art for', n); return; }
      var e = cache[n] = { m: m, grey: new Image(), layers: {} };
      var files = [['grey', e.grey]];
      m.groups.forEach(function (g) { e.layers[g] = new Image(); files.push([g, e.layers[g]]); });
      files.forEach(function (f) {
        left++;
        f[1].onload = f[1].onerror = function () { if (--left === 0 && done) done(); };
        f[1].src = 'images/build/' + n + '/' + f[0] + '.png';
      });
    });
    if (left === 0 && done) done();
  };

  Art.hasPainted = function (n) { return !!cache[n] && cache[n].grey.complete && cache[n].grey.naturalWidth > 0; };

  // Draw image `n` so that its pixel (ax, ay) lands at the current origin, scaled by s.
  Art.drawPainted = function (ctx, n, ax, ay, s) {
    var e = cache[n]; if (!e) return;
    var lv = Art.levelsOverride || Art.levels;
    var w = e.m.w * s, h = e.m.h * s, x = -ax * s, y = -ay * s;
    ctx.drawImage(e.grey, x, y, w, h);
    var a = ctx.globalAlpha;
    for (var g in e.layers) {
      var k = lv[g] || 0;
      if (k <= 0.001) continue;
      ctx.globalAlpha = a * Math.min(1, k);
      ctx.drawImage(e.layers[g], x, y, w, h);
    }
    ctx.globalAlpha = a;
  };

  // Colour of a palette entry using the override levels when set.
  Art.cc = function (name) {
    if (!Art.levelsOverride) return Art.c(name);
    var saved = Art.levels; Art.levels = Art.levelsOverride;
    var c = Art.c(name); Art.levels = saved; return c;
  };
})();
