// ============================================================
//  UI: HUD (mental health bar, score), banners, old-film effect.
// ============================================================
window.UI = (function () {
  var INK = '#2A1E16', PAPER = '#EFE8D8';
  var BODY = '"Playfair Display", Georgia, serif', TITLE = '"Bungee Shade", "Playfair Display", serif';
  var shown = null;   // health shown on the bar, eases toward the real value

  function panel(ctx, x, y, w, h) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 10);
    ctx.fillStyle = 'rgba(239,232,216,0.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }
  function text(ctx, s, x, y, size, opts) {
    opts = opts || {};
    ctx.font = (opts.weight || '700') + ' ' + size + 'px ' + (opts.font || BODY);
    ctx.textAlign = opts.align || 'left'; ctx.lineJoin = 'round';
    if (opts.outline) { ctx.lineWidth = opts.outline; ctx.strokeStyle = PAPER; ctx.strokeText(s, x, y); }
    ctx.fillStyle = opts.color || INK; ctx.fillText(s, x, y);
  }

  function hud(ctx, G, dt) {
    var p = G.player, max = CONFIG.health.max;
    if (shown === null) shown = p.health;
    shown += (p.health - shown) * Math.min(1, dt * 6);
    // mental health
    panel(ctx, 20, 18, 320, 70);
    text(ctx, TEXT.HUD_HEALTH, 38, 46, 20);
    ctx.beginPath(); ctx.roundRect(38, 56, 284, 18, 9); ctx.fillStyle = '#B9B2A4'; ctx.fill();
    var k = Math.max(0, shown / max), low = p.health / max < 0.3;
    if (k > 0) {
      ctx.beginPath(); ctx.roundRect(38, 56, Math.max(18, 284 * k), 18, 9);
      ctx.fillStyle = low && Math.floor(G.t * 4) % 2 ? '#C8423B' : '#E3A72F'; ctx.fill();
    }
    ctx.beginPath(); ctx.roundRect(38, 56, 284, 18, 9); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    // score
    panel(ctx, CONFIG.width - 240, 18, 220, 70);
    text(ctx, TEXT.HUD_SCORE, CONFIG.width - 222, 46, 20);
    text(ctx, String(G.score).padStart(6, '0'), CONFIG.width - 38, 78, 26, { align: 'right' });
  }

  function banner(ctx, title, sub, alpha) {
    var W = CONFIG.width, H = CONFIG.height;
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    panel(ctx, W / 2 - 360, H / 2 - 90, 720, sub ? 170 : 120);
    text(ctx, title, W / 2, H / 2 - 10, 46, { align: 'center', font: TITLE, weight: '400' });
    if (sub) text(ctx, sub, W / 2, H / 2 + 50, 24, { align: 'center', weight: '400' });
    ctx.restore();
  }

  // old film: grain, vignette, flicker, scratches
  var grain = [];
  for (var n = 0; n < 4; n++) {
    var gc = document.createElement('canvas'); gc.width = gc.height = 256;
    var gx = gc.getContext('2d'), img = gx.createImageData(256, 256);
    for (var i = 0; i < img.data.length; i += 4) { var v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gx.putImageData(img, 0, 0); grain.push(gc);
  }
  function film(ctx, t) {
    if (!CONFIG.filmEffect) return;
    var w = CONFIG.width, h = CONFIG.height;
    ctx.save();
    ctx.globalAlpha = 0.07; ctx.fillStyle = ctx.createPattern(grain[Math.floor(t * 24) % 4], 'repeat'); ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    var v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.65);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,15,5,0.5)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.035) + ')'; ctx.fillRect(0, 0, w, h);
    if (Math.random() < 0.06) {
      ctx.strokeStyle = 'rgba(255,250,235,0.3)'; ctx.lineWidth = 1;
      var sx = Math.random() * w; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 6, h); ctx.stroke();
    }
    ctx.restore();
  }

  return { hud: hud, banner: banner, film: film, text: text, panel: panel, resetBar: function () { shown = null; } };
})();
