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

  function banner(ctx, title, sub, alpha, subColor) {
    var W = CONFIG.width, H = CONFIG.height;
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    panel(ctx, W / 2 - 360, H / 2 - 90, 720, sub ? 170 : 120);
    text(ctx, title, W / 2, H / 2 - 10, 46, { align: 'center', font: TITLE, weight: '400' });
    if (sub) text(ctx, sub, W / 2, H / 2 + 50, subColor ? 34 : 24, { align: 'center', weight: subColor ? '700' : '400', color: subColor });
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

  function wrap(ctx, s, maxW) {
    var words = s.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function bossBar(ctx, name, k) {
    var W = CONFIG.width, w = 520, x = (W - w) / 2;
    panel(ctx, x - 18, 14, w + 36, 74);
    text(ctx, name, W / 2, 44, 24, { align: 'center', font: TITLE, weight: '400' });
    ctx.beginPath(); ctx.roundRect(x, 56, w, 16, 8); ctx.fillStyle = '#B9B2A4'; ctx.fill();
    if (k > 0) { ctx.beginPath(); ctx.roundRect(x, 56, Math.max(16, w * k), 16, 8); ctx.fillStyle = '#C8423B'; ctx.fill(); }
    ctx.beginPath(); ctx.roundRect(x, 56, w, 16, 8); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }

  // 1930s intertitle: dark card, cream ornamental border, centred italic text
  function storyCard(ctx, s, t, showHint) {
    var W = CONFIG.width, H = CONFIG.height, CREAM = '#EFE6CF';
    ctx.fillStyle = '#16120E'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = CREAM; ctx.lineWidth = 3; ctx.strokeRect(60, 50, W - 120, H - 100);
    ctx.lineWidth = 1.5; ctx.strokeRect(74, 64, W - 148, H - 128);
    [[74, 64], [W - 74, 64], [74, H - 64], [W - 74, H - 64]].forEach(function (c) {   // corner flourishes
      ctx.beginPath(); ctx.arc(c[0], c[1], 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(c[0], c[1], 5, 0, Math.PI * 2); ctx.fillStyle = CREAM; ctx.fill();
    });
    ctx.font = 'italic 400 42px ' + BODY; ctx.textAlign = 'center'; ctx.fillStyle = CREAM;
    var lines = wrap(ctx, s, W - 340), y0 = H / 2 - (lines.length - 1) * 30;
    ctx.globalAlpha = Math.min(1, t * 1.5);
    lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y0 + i * 60); });
    ctx.globalAlpha = 1;
    if (showHint && Math.floor(t / 0.6) % 2 === 0) text(ctx, TEXT.PRESS_CONTINUE, W / 2, H - 100, 22, { align: 'center', weight: '400', color: '#B8AE96' });
  }

  // quote card: paper, heading, quote, source
  function quoteCard(ctx, q, t, showHint) {
    var W = CONFIG.width, H = CONFIG.height;
    ctx.fillStyle = '#E9DFC7'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(70, 60, W - 140, H - 120);
    text(ctx, TEXT.QUOTE_HEADING, W / 2, 150, 28, { align: 'center', font: TITLE, weight: '400' });
    ctx.globalAlpha = Math.min(1, t * 1.2);
    ctx.font = 'italic 400 40px ' + BODY; ctx.textAlign = 'center'; ctx.fillStyle = INK;
    var lines = wrap(ctx, '\u201C' + q.text + '\u201D', W - 320), y0 = H / 2 - (lines.length - 1) * 28 - 10;
    lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y0 + i * 56); });
    var src = '\u2014 ' + q.author + ', ' + q.work + ' ' + q.section + (q.translator ? '  (tr. ' + q.translator + ')' : '');
    text(ctx, src, W / 2, y0 + lines.length * 56 + 30, 24, { align: 'center', weight: '400' });
    ctx.globalAlpha = 1;
    if (showHint && Math.floor(t / 0.6) % 2 === 0) text(ctx, TEXT.PRESS_CONTINUE, W / 2, H - 100, 22, { align: 'center', weight: '400', color: '#6E6A62' });
  }

  return { hud: hud, bossBar: bossBar, storyCard: storyCard, quoteCard: quoteCard, banner: banner, film: film, text: text, panel: panel, resetBar: function () { shown = null; } };
})();
