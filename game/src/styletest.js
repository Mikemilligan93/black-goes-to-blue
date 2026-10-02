// Style test page logic (not part of the game itself).
(function () {
  var C = Art.c, INK = Art.PAL.ink[0];
  var groups = Object.keys(Art.GROUPS);
  var target = {}; groups.forEach(function (g) { target[g] = 0; });

  // ---------------- Controls ----------------
  var btnBox = document.getElementById('groupButtons');
  var buttons = {};
  groups.forEach(function (g) {
    var b = document.createElement('button');
    b.textContent = Art.GROUPS[g].name;
    b.onclick = function () { target[g] = target[g] ? 0 : 1; refreshButtons(); };
    btnBox.appendChild(b); buttons[g] = b;
  });
  function refreshButtons() {
    groups.forEach(function (g) {
      var b = buttons[g];
      b.classList.toggle('on', !!target[g]);
      b.style.background = target[g] ? Art.GROUPS[g].hex : '#fff';
    });
  }
  refreshButtons();
  document.getElementById('allGrey').onclick = function () { groups.forEach(function (g) { target[g] = 0; }); refreshButtons(); };
  document.getElementById('allColour').onclick = function () { groups.forEach(function (g) { target[g] = 1; }); refreshButtons(); };
  var moodEl = document.getElementById('mood'), linkEl = document.getElementById('link'), filmEl = document.getElementById('film');

  // ---------------- Input ----------------
  var keys = {};
  var play = document.getElementById('play');
  window.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].indexOf(e.key) >= 0 && document.activeElement === play) e.preventDefault();
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'x' && p.attack <= 0 && p.hurt <= 0) p.attack = 0.28;
    if (e.key.toLowerCase() === 'h' && p.hurt <= 0) { p.hurt = 0.6; p.vy = -420; p.vx = -p.facing * 260; p.ground = false; }
  });
  window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });
  play.addEventListener('click', function () { play.focus(); });

  // ---------------- Player physics (prototype) ----------------
  var FLOOR = 410;
  var p = { x: 640, y: FLOOR, vx: 0, vy: 0, facing: 1, ground: true, phase: 0, hurt: 0, attack: 0, jumpHeld: false };

  function update(dt, mood) {
    var left = keys['arrowleft'] || keys['a'], right = keys['arrowright'] || keys['d'];
    var jump = keys[' '] || keys['w'] || keys['arrowup'];
    var max = 240 + mood * 80;
    if (p.attack > 0) p.attack -= dt;
    if (p.hurt > 0) { p.hurt -= dt; }
    else {
      var dir = (right ? 1 : 0) - (left ? 1 : 0);
      if (dir) { p.vx += dir * 2400 * dt; p.facing = dir; }
      else { p.vx *= Math.pow(0.0005, dt); }
      p.vx = Math.max(-max, Math.min(max, p.vx));
      if (jump && p.ground && !p.jumpHeld) { p.vy = -880; p.ground = false; }
      if (!jump && p.vy < -300) p.vy = -300; // short hop when released early
    }
    p.jumpHeld = jump;
    p.vy += 2600 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y >= FLOOR) { p.y = FLOOR; p.vy = 0; p.ground = true; }
    p.x = Math.max(40, Math.min(1240, p.x));
    if (p.ground) p.phase += Math.abs(p.vx) * dt / 17;
  }

  // ---------------- World (placeholder, drawn in code) ----------------
  function world(ctx, t) {
    if (Art.hasPainted('level1_bg')) {   // Nano Banana background with per-colour return
      var sc = 1280 / ART_MANIFEST.level1_bg.w;
      ctx.save(); ctx.translate(0, 480 - ART_MANIFEST.level1_bg.h * sc);
      Art.drawPainted(ctx, 'level1_bg', 0, 0, sc);
      ctx.restore();
      return;
    }
    ctx.fillStyle = C('wall'); ctx.fillRect(0, 0, 1280, FLOOR);
    ctx.fillStyle = C('wallStripe');
    for (var x = 0; x < 1280; x += 48) ctx.fillRect(x, 0, 16, FLOOR - 70);
    ctx.fillStyle = Art.PAL.white[0]; ctx.fillRect(0, FLOOR - 74, 1280, 8);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-5, FLOOR - 74, 1290, 8);

    // window with sky
    ctx.fillStyle = C('sky'); ctx.fillRect(180, 70, 240, 200);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    [[230 + (t * 8) % 260, 120, 30], [330 + (t * 5) % 200, 180, 22]].forEach(function (c) {
      var cx = 180 + ((c[0] - 180) % 240 + 240) % 240;
      ctx.save(); ctx.beginPath(); ctx.rect(180, 70, 240, 200); ctx.clip();
      ctx.beginPath(); ctx.arc(cx, c[1], c[2], 0, 7); ctx.arc(cx + c[2], c[1] + 6, c[2] * 0.8, 0, 7); ctx.arc(cx - c[2], c[1] + 8, c[2] * 0.7, 0, 7); ctx.fill();
      ctx.restore();
    });
    ctx.lineWidth = 8; ctx.strokeStyle = Art.PAL.white[0]; ctx.strokeRect(180, 70, 240, 200);
    ctx.beginPath(); ctx.moveTo(300, 70); ctx.lineTo(300, 270); ctx.moveTo(180, 170); ctx.lineTo(420, 170); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.strokeRect(176, 66, 248, 208);

    // clock (wobbly, rubber-hose style)
    var sq = 1 + Math.sin(t * 4) * 0.04;
    ctx.save(); ctx.translate(720, 130); ctx.scale(1 / sq, sq);
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fillStyle = Art.PAL.white[0]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.5) * 22, Math.sin(t * 0.5) * 22);
    ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 3) * 32, Math.sin(t * 3) * 32); ctx.stroke();
    ctx.restore();

    // hanging lamp
    var sw = Math.sin(t * 1.3) * 0.06;
    ctx.save(); ctx.translate(540, 0); ctx.rotate(sw);
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 110); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 110); ctx.lineTo(14, 110); ctx.lineTo(40, 150); ctx.lineTo(-40, 150); ctx.closePath();
    ctx.fillStyle = C('lamp'); ctx.fill(); ctx.lineWidth = 3.5; ctx.stroke();
    ctx.restore();

    // potted plant (droops less as green returns)
    var g = Art.levels.green;
    ctx.save(); ctx.translate(1040, FLOOR);
    for (var i = -2; i <= 2; i++) {
      var a = i * 0.45 + Math.sin(t * 2 + i) * 0.05, droop = (1 - g) * 0.5 * Math.sign(i);
      ctx.save(); ctx.translate(0, -70); ctx.rotate(a + droop);
      ctx.beginPath(); ctx.ellipse(0, -45, 14, 46, 0, 0, 7);
      ctx.fillStyle = i % 2 ? C('plantDark') : C('plant'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(-40, -80); ctx.lineTo(40, -80); ctx.lineTo(30, 0); ctx.lineTo(-30, 0); ctx.closePath();
    ctx.fillStyle = C('pot'); ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();

    // floor
    ctx.fillStyle = C('floor'); ctx.fillRect(0, FLOOR, 1280, 480 - FLOOR);
    ctx.strokeStyle = C('floorLine'); ctx.lineWidth = 2;
    for (var y = FLOOR + 22; y < 480; y += 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(1280, FLOOR); ctx.stroke();
  }

  // ---------------- Old film effect ----------------
  var grain = [];
  for (var n = 0; n < 4; n++) {
    var gc = document.createElement('canvas'); gc.width = gc.height = 256;
    var gx = gc.getContext('2d'), img = gx.createImageData(256, 256);
    for (var k = 0; k < img.data.length; k += 4) { var v = Math.random() * 255; img.data[k] = img.data[k + 1] = img.data[k + 2] = v; img.data[k + 3] = 255; }
    gx.putImageData(img, 0, 0); grain.push(gc);
  }
  function film(ctx, w, h, t) {
    ctx.save();
    ctx.globalAlpha = 0.07; ctx.fillStyle = ctx.createPattern(grain[Math.floor(t * 24) % 4], 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    var v = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.65);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,15,5,0.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.04) + ')'; ctx.fillRect(0, 0, w, h);
    if (Math.random() < 0.08) {
      ctx.strokeStyle = 'rgba(255,250,235,0.35)'; ctx.lineWidth = 1;
      var sx = Math.random() * w; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 6, h); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------- Lineup ----------------
  var lineup = document.getElementById('lineup'), lctx = lineup.getContext('2d');
  function drawLineup(t) {
    lctx.fillStyle = Art.PAL.paper[0]; lctx.fillRect(0, 0, 1280, 350);
    var poses = ['idle', 'walk', 'jump', 'hurt', 'attack'];
    [0, 1].forEach(function (side) {
      var lv = {}; groups.forEach(function (g) { lv[g] = side; }); Art.levelsOverride = lv;
      lctx.fillStyle = INK; lctx.font = '700 22px "Playfair Display", serif'; lctx.textAlign = 'center';
      lctx.fillText(side ? 'Recovered (all colour, mood 1)' : 'Burnt out (grey, mood 0)', 320 + side * 640, 34);
      poses.forEach(function (pose, i) {
        var x = 76 + side * 640 + i * 122, vy = pose === 'jump' ? Math.sin(t * 2.5) * 900 : 0;
        Art.drawPuppet(lctx, x, pose === 'jump' ? 285 : 305, { pose: pose, t: t, phase: t * 9, vy: vy, facing: 1, mood: side });
        lctx.font = '16px "Playfair Display", serif'; lctx.fillStyle = '#6E6A62';
        lctx.fillText(pose, x, 338);
      });
    });
    Art.levelsOverride = null;
    lctx.fillStyle = INK; lctx.fillRect(639, 50, 2, 290);
  }

  // ---------------- Palette ----------------
  var sw = document.getElementById('swatches');
  groups.forEach(function (g) {
    var hex = Art.GROUPS[g].hex, gr = Art._grey(Art._rgb(hex)).map(Math.round);
    sw.insertAdjacentHTML('beforeend',
      '<div class="sw"><div><span style="background:rgb(' + gr.join(',') + ')"></span><span style="background:' + hex + '"></span></div>' +
      '<p><b>' + Art.GROUPS[g].name + '</b><br>' + hex + '</p></div>');
  });
  [['Ink', 'ink'], ['Paper', 'paper'], ['Shirt white', 'white']].forEach(function (n) {
    var hex = Art.PAL[n[1]][0];
    sw.insertAdjacentHTML('beforeend', '<div class="sw"><div><span style="background:' + hex + '"></span></div><p><b>' + n[0] + '</b><br>' + hex + ' (never changes)</p></div>');
  });

  // ---------------- Fonts ----------------
  var fonts = document.getElementById('fonts');
  ['Limelight', 'Rye', 'Bungee Shade'].forEach(function (f) {
    fonts.insertAdjacentHTML('beforeend', '<div class="font"><div class="tag">Title font candidate: ' + f + '</div>' +
      '<div class="big" style="font-family:\'' + f + '\'">Rubber-Hose Recovery</div>' +
      '<div class="mid" style="font-family:\'' + f + '\'">Level 1 &middot; Monday. Again.</div></div>');
  });
  ['Old Standard TT', 'Playfair Display'].forEach(function (f) {
    fonts.insertAdjacentHTML('beforeend', '<div class="font"><div class="tag">Body font candidate: ' + f + '</div>' +
      '<div class="body" style="font-family:\'' + f + '\'"><i>This line shows how a stoic quote will look on a loading screen, in italics, across two lines of text.</i><br>' +
      '&mdash; Author, Work 1.2 (translated by Translator)<br>Score: 12,450 &middot; Press Space to continue</div></div>');
  });

  // ---------------- Main loop ----------------
  var ctx = play.getContext('2d'), last = performance.now(), t0 = last;
  function frame(now) {
    var dt = Math.max(0, Math.min(1 / 30, (now - last) / 1000)), t = Math.max(0, (now - t0) / 1000); last = now;
    groups.forEach(function (g) {
      var d = target[g] - Art.levels[g];
      Art.levels[g] += Math.sign(d) * Math.min(Math.abs(d), dt * 1.2);
    });
    var restored = groups.reduce(function (s, g) { return s + Art.levels[g]; }, 0) / groups.length;
    if (linkEl.checked) moodEl.value = restored;
    var mood = parseFloat(moodEl.value);

    update(dt, mood);
    world(ctx, t);
    var pose = p.hurt > 0 ? 'hurt' : p.attack > 0 ? 'attack' : !p.ground ? 'jump' : Math.abs(p.vx) > 20 ? 'walk' : 'idle';
    Art.drawPuppet(ctx, p.x, p.y, { pose: pose, t: t, phase: p.phase, vy: p.vy, facing: p.facing, mood: mood });
    if (filmEl.checked) film(ctx, 1280, 480, t);
    drawLineup(t);
    requestAnimationFrame(frame);
  }
  Art.loadPainted(Art.PUPPET_PARTS.concat(['level1_bg']), function () { requestAnimationFrame(frame); });
})();
