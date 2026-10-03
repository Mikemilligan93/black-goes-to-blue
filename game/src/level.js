// ============================================================
//  LEVEL: reads a text map (levels/*.js + levels/legend.js) and draws it.
//  Painted props are used when their art exists; otherwise simple placeholders.
// ============================================================
window.Level = (function () {
  var T, INK = '#2A1E16';

  function painted(art) { return art && window.ART_MANIFEST && ART_MANIFEST[art] && Art.hasPainted(art); }
  function artW(def, h) { return painted(def.art) ? h * ART_MANIFEST[def.art].w / ART_MANIFEST[def.art].h : (def.w || 1) * T; }

  function build(id) {
    T = CONFIG.tile;
    var d = LEVEL_DATA[id], rows = d.map, H = rows.length;
    var W = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var L = { id: id, data: d, cols: W, rows: H, w: W * T, h: H * T, solids: [], ground: [], planks: [], props: [],
              hazards: [], checkpoints: [], enemies: [], start: { x: 2 * T, y: (H - 2) * T }, exit: null, unknown: {} };
    for (var r = 0; r < H; r++) {
      var row = rows[r];
      // runs of ground (#) and planks (=)
      ['#', '='].forEach(function (ch) {
        var c = 0;
        while (c < row.length) {
          if (row[c] !== ch) { c++; continue; }
          var c0 = c; while (row[c] === ch) c++;
          if (ch === '#') {
            var g = { x: c0 * T, y: r * T, w: (c - c0) * T, h: T, top: r === 0 || (rows[r - 1][c0] !== '#') };
            L.ground.push(g); L.solids.push(g);
          } else {
            var p = { x: c0 * T, y: r * T, w: (c - c0) * T, h: 12, oneway: true };
            L.planks.push(p); L.solids.push(p);
          }
        }
      });
      for (var c = 0; c < row.length; c++) {
        var ch = row[c], def = LEGEND[ch];
        if (!def) { L.unknown[ch] = true; continue; }
        var x = c * T, bottom = (r + 1) * T, h, w;
        if (def.type === 'prop') {
          h = def.h * T; w = artW(def, h);
          var pr = { x: x, y: bottom - h, w: w, h: h, art: def.art, oneway: def.solid === 'oneway' };
          L.props.push(pr); L.solids.push(pr);
        } else if (def.type === 'hazard') {
          h = def.h * T; w = artW(def, h);
          L.hazards.push({ x: x, y: bottom - h, w: w, h: h, art: def.art, damage: def.damage,
                           hit: { x: x + w * 0.12, y: bottom - h * 0.7, w: w * 0.76, h: h * 0.7 } });
        } else if (def.type === 'checkpoint') {
          h = def.h * T; w = artW(def, h);
          L.checkpoints.push({ x: x, y: bottom - h, w: w, h: h, art: def.art, active: false });
        } else if (def.type === 'enemy') {
          L.enemies.push(Actors.makeEnemy(x + T / 2, bottom, def.kind));
        } else if (def.type === 'start') {
          L.start = { x: x + T / 2, y: bottom };
        } else if (def.type === 'boss') {
          L.bossSpot = { x: x, floor: bottom, boss: def.boss };
        } else if (def.type === 'exit') {
          L.exit = { x: x, y: bottom - def.h * T, w: def.w * T, h: def.h * T };
        }
      }
    }
    delete L.unknown['#']; delete L.unknown['='];
    var unk = Object.keys(L.unknown);
    if (unk.length) console.warn('Unknown letters in ' + id + ': ' + unk.join(' '));
    return L;
  }

  // ---------------- drawing ----------------
  function box(ctx, x, y, w, h, fill, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r || 6);
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }

  function drawBackground(ctx, L, cam) {
    var name = L.data.background, W = CONFIG.width, H = CONFIG.height;
    if (!painted(name)) { ctx.fillStyle = Art.c('wall'); ctx.fillRect(0, 0, W, H); return; }
    var m = ART_MANIFEST[name], sc = H / m.h, bw = m.w * sc;
    var off = -cam.x * CONFIG.backgroundParallax;
    var i0 = Math.floor(-off / bw);
    for (var i = i0; off + i * bw < W; i++) {
      ctx.save();
      if (i % 2) { ctx.translate(off + (i + 1) * bw, 0); ctx.scale(-1, 1); }   // mirror every other copy: no seams
      else ctx.translate(off + i * bw, 0);
      Art.drawPainted(ctx, name, 0, 0, sc);
      ctx.restore();
    }
  }

  function drawGround(ctx, g) {
    ctx.fillStyle = Art.c('floor'); ctx.fillRect(g.x, g.y, g.w, g.h);
    ctx.strokeStyle = Art.c('floorLine'); ctx.lineWidth = 2;
    for (var y = g.y + 14; y < g.y + g.h; y += 14) { ctx.beginPath(); ctx.moveTo(g.x, y); ctx.lineTo(g.x + g.w, y); ctx.stroke(); }
    if (g.top) {   // front board with a soft highlight
      ctx.fillStyle = Art.c('lamp'); ctx.globalAlpha = 0.35; ctx.fillRect(g.x, g.y + 2, g.w, 6); ctx.globalAlpha = 1;
      ctx.strokeStyle = Art.c('floorLine'); ctx.lineWidth = 2;
      for (var x = g.x + 37; x < g.x + g.w; x += 74) { ctx.beginPath(); ctx.moveTo(x, g.y); ctx.lineTo(x, g.y + 14); ctx.stroke(); }
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
    if (g.top) { ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + g.w, g.y); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(g.x, g.y + g.h); ctx.moveTo(g.x + g.w, g.y); ctx.lineTo(g.x + g.w, g.y + g.h); ctx.stroke();
  }

  function drawPlank(ctx, p) {
    ctx.fillStyle = INK;
    for (var x = p.x + 14; x < p.x + p.w; x += Math.max(60, p.w - 28)) {   // brackets
      ctx.beginPath(); ctx.moveTo(x - 4, p.y + 10); ctx.lineTo(x + 4, p.y + 10); ctx.lineTo(x, p.y + 28); ctx.closePath(); ctx.fill();
    }
    box(ctx, p.x, p.y, p.w, p.h, Art.c('floor'), 4);
  }

  function drawPaintedFit(ctx, o) {
    var m = ART_MANIFEST[o.art], sc = o.h / m.h;
    ctx.save(); ctx.translate(o.x, o.y); Art.drawPainted(ctx, o.art, 0, 0, sc); ctx.restore();
  }

  function drawProp(ctx, p) {
    if (painted(p.art)) return drawPaintedFit(ctx, p);
    var name = p.art.replace('props_', '');
    if (name === 'desk') {
      box(ctx, p.x, p.y, p.w, 16, Art.c('floor'), 4);
      box(ctx, p.x + 8, p.y + 16, p.w * 0.4, p.h - 16, Art.c('floorLine'), 2);
      box(ctx, p.x + p.w - 22, p.y + 16, 14, p.h - 16, Art.c('floorLine'), 2);
    } else if (name === 'cabinet') {
      box(ctx, p.x, p.y, p.w, p.h, Art.c('wallStripe'), 4);
      for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(p.x + 6, p.y + p.h * i / 4); ctx.lineTo(p.x + p.w - 6, p.y + p.h * i / 4); ctx.stroke(); }
    } else if (name === 'shelf') {
      box(ctx, p.x, p.y, p.w, p.h, Art.c('floorLine'), 4);
      ctx.beginPath(); ctx.moveTo(p.x, p.y + p.h / 2); ctx.lineTo(p.x + p.w, p.y + p.h / 2); ctx.stroke();
    } else {
      box(ctx, p.x, p.y + p.h / 2, p.w, p.h / 2, Art.c('lamp'), 3);
      box(ctx, p.x + 4, p.y, p.w - 8, p.h / 2, Art.c('lamp'), 3);
    }
  }

  function drawHazard(ctx, z, t) {
    if (painted(z.art)) return drawPaintedFit(ctx, z);
    if (z.damage === 'coffee') {
      ctx.beginPath(); ctx.ellipse(z.x + z.w / 2, z.y + z.h * 0.6, z.w / 2, z.h * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = Art.c('hair'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    } else {
      for (var i = 0; i < 5; i++) {
        ctx.save(); ctx.translate(z.x + 10 + i * (z.w - 20) / 4, z.y + z.h - 6); ctx.rotate((i - 2) * 0.35);
        box(ctx, -10, -z.h + 8, 20, z.h - 4, Art.PAL.white[0], 2);
        ctx.fillStyle = Art.c('tie'); ctx.fillRect(-6, -z.h + 16, 12, 3); ctx.restore();
      }
    }
  }

  function drawCheckpoint(ctx, cp, t) {
    if (painted(cp.art)) drawPaintedFit(ctx, cp);
    else {
      box(ctx, cp.x + 6, cp.y + cp.h * 0.4, cp.w - 12, cp.h * 0.6, Art.PAL.white[0], 4);
      ctx.beginPath(); ctx.ellipse(cp.x + cp.w / 2, cp.y + cp.h * 0.22, cp.w / 2 - 4, cp.h * 0.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = Art.c('sky'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    }
    if (cp.active) {   // bubbles rising in the bottle
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      for (var i = 0; i < 4; i++) {
        var k = (t * 0.6 + i / 4) % 1;
        ctx.beginPath(); ctx.arc(cp.x + cp.w / 2 + Math.sin(k * 9 + i) * 5, cp.y + cp.h * (0.38 - k * 0.3), 3 + i % 2, 0, 7);
        ctx.fill(); ctx.stroke();
      }
    }
  }

  function drawExit(ctx, e, t) {
    box(ctx, e.x - 8, e.y - 8, e.w + 16, e.h + 8, Art.c('floorLine'), 6);              // frame
    box(ctx, e.x, e.y, e.w, e.h, Art.c('floor'), 4);                                    // door
    box(ctx, e.x + 14, e.y + 18, e.w - 28, e.h * 0.28, 'rgba(255,240,200,' + (0.75 + Math.sin(t * 3) * 0.15) + ')', 3); // lit window
    ctx.beginPath(); ctx.arc(e.x + e.w - 14, e.y + e.h * 0.58, 5, 0, 7); ctx.fillStyle = Art.c('lamp'); ctx.fill(); ctx.stroke();
  }

  function drawPits(ctx, L) {
    var top = L.ground.filter(function (g) { return g.top; });
    if (!top.length) return;
    var y = Math.min.apply(null, top.map(function (g) { return g.y; }));
    var grad = ctx.createLinearGradient(0, y, 0, y + 90);
    grad.addColorStop(0, '#3a2c20'); grad.addColorStop(1, '#0d0907');
    ctx.fillStyle = grad; ctx.fillRect(0, y, L.w, L.h - y + 400);
  }

  function draw(ctx, L, t) {
    drawPits(ctx, L);
    L.planks.forEach(function (p) { drawPlank(ctx, p); });
    L.props.forEach(function (p) { drawProp(ctx, p); });
    L.checkpoints.forEach(function (c) { drawCheckpoint(ctx, c, t); });
    if (L.exit) drawExit(ctx, L.exit, t);
    L.hazards.forEach(function (z) { drawHazard(ctx, z, t); });
    L.ground.forEach(function (g) { drawGround(ctx, g); });
  }

  // all painted art a level may need (only names that exist in the manifest)
  function artList(id) {
    var names = [LEVEL_DATA[id].background];
    Object.keys(LEGEND).forEach(function (k) { if (LEGEND[k].art) names.push(LEGEND[k].art); });
    names.push('props_envelope', 'props_envelope_hit');
    Object.keys(window.Bosses || {}).forEach(function (k) { names = names.concat(Bosses[k].art); });
    return names.filter(function (n) { return window.ART_MANIFEST && ART_MANIFEST[n]; });
  }

  return { build: build, draw: draw, drawBackground: drawBackground, artList: artList, painted: painted };
})();
