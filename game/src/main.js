// ============================================================
//  MAIN: screens (title, playing, paused, level done) and the game loop.
//  Add ?debug to the address to get colour keys 1-6 / 0 and hitboxes (H).
// ============================================================
(function () {
  if (!window.checkDataFiles()) return;
  document.title = TEXT.GAME_TITLE;
  var canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  var W = CONFIG.width, H = CONFIG.height, STEP = 1 / CONFIG.fps;
  var DEBUG = /[?&]debug/.test(location.search), showBoxes = false;
  var GROUPS = Object.keys(Art.GROUPS), target = {};
  GROUPS.forEach(function (g) { target[g] = Art.levels[g]; });

  function fit() {
    var s = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = Math.floor(W * s) + 'px'; canvas.style.height = Math.floor(H * s) + 'px';
  }
  window.addEventListener('resize', fit); fit();
  window.addEventListener('keydown', function (e) {
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen();
    }
  });

  // ---------------- game state ----------------
  var G = { state: 'loading', t: 0, score: 0, levelId: 'level1', L: null, player: null, cam: { x: 0, y: 0 },
            balls: [], bits: [], popups: [], introT: 0 };
  window.G = G;   // handy for debugging in the browser console

  function startLevel(id) {
    G.levelId = id; G.L = Level.build(id); G.player = Actors.makePlayer(G.L.start.x, G.L.start.y);
    G.balls = []; G.bits = []; G.popups = []; G.introT = 2.8; G.state = 'play';
    snapCamera(); UI.resetBar(); Sound.music(G.L.data.music);
  }

  G.hurtPlayer = function (amount, fromX, fell) {
    var p = G.player, HC = CONFIG.health;
    if (!fell && p.invuln > 0) return;
    p.health = Math.max(0, p.health - amount); Sound.play('sfx_hit');
    if (fell || p.health <= 0) {
      if (p.health <= 0) { p.health = HC.respawnHealth; Actors.popup(G, p.respawn.x, p.respawn.y - 180, TEXT.EXHAUSTED, 2.5); }
      else Actors.popup(G, p.respawn.x, p.respawn.y - 180, TEXT.FELL, 2);
      p.x = p.respawn.x; p.y = p.respawn.y; p.vx = p.vy = 0; p.hurtT = 0; p.invuln = HC.invulnerable;
      snapCamera(); return;
    }
    p.invuln = HC.invulnerable; p.hurtT = 0.4; p.vy = -420;
    p.vx = (fromX === null || fromX === undefined ? -p.facing : Math.sign(p.x - fromX) || -p.facing) * CONFIG.enemy.knockback;
  };

  function camTarget() {
    var p = G.player, L = G.L;
    return { x: Math.max(0, Math.min(L.w - W, p.x - W / 2 + p.facing * CONFIG.camera.lead)),
             y: Math.max(0, Math.min(L.h - H, p.y - H * 0.62)) };
  }
  function snapCamera() { var c = camTarget(); G.cam.x = c.x; G.cam.y = c.y; }

  // ---------------- update ----------------
  function update(dt) {
    G.t += dt;
    if (Input.hit('mute')) { var m = Sound.toggleMute(); if (G.player) Actors.popup(G, G.player.x, G.player.y - 190, m ? TEXT.SOUND_OFF : TEXT.SOUND_ON, 1); }
    if (DEBUG) {
      for (var i = 0; i < GROUPS.length; i++) if (Input.key(String(i + 1))) target[GROUPS[i]] = target[GROUPS[i]] ? 0 : 1;
      if (Input.key('0')) GROUPS.forEach(function (g) { target[g] = 0; });
      if (Input.key('h')) showBoxes = !showBoxes;
    }
    GROUPS.forEach(function (g) {   // colours fade in and out smoothly
      var d = target[g] - Art.levels[g]; Art.levels[g] += Math.sign(d) * Math.min(Math.abs(d), dt * 0.8);
    });

    if (G.state === 'title') {
      if (Input.hit('start')) { Sound.play('sfx_ui'); startLevel('level1'); }
    } else if (G.state === 'play') {
      if (Input.hit('pause')) { G.state = 'paused'; return; }
      var L = G.L, p = G.player;
      G.introT = Math.max(0, G.introT - dt);
      Actors.updatePlayer(p, L, dt, G);
      L.enemies.forEach(function (e) { Actors.updateEnemy(e, L, dt, G); });
      Actors.updateBalls(G, L, dt);
      var pb = Actors.boxOf(p);
      L.hazards.forEach(function (z) { if (Actors.overlap(pb, z.hit)) G.hurtPlayer(CONFIG.health[z.damage] || 10, z.x + z.w / 2); });
      L.checkpoints.forEach(function (cp) {
        if (!cp.active && Actors.overlap(pb, cp)) {
          L.checkpoints.forEach(function (o) { o.active = false; });
          cp.active = true; p.respawn = { x: cp.x + cp.w / 2, y: cp.y + cp.h };
          p.health = CONFIG.health.max; Sound.play('sfx_checkpoint');
          Actors.popup(G, cp.x + cp.w / 2, cp.y - 30, TEXT.CHECKPOINT, 2.5);
        }
      });
      if (L.exit && Actors.overlap(pb, L.exit)) { G.state = 'done'; Sound.play('sfx_boss_defeat'); }
      var c = camTarget(), k = Math.min(1, dt * CONFIG.camera.smooth);
      G.cam.x += (c.x - G.cam.x) * k; G.cam.y += (c.y - G.cam.y) * k;
    } else if (G.state === 'paused') {
      if (Input.hit('pause')) G.state = 'play';
    } else if (G.state === 'done') {
      if (Input.hit('start')) { Sound.play('sfx_ui'); G.score = 0; G.state = 'title'; Sound.music('music_title'); }
    }
  }

  // ---------------- draw ----------------
  function mood() { return GROUPS.reduce(function (s, g) { return s + Art.levels[g]; }, 0) / GROUPS.length; }

  function drawWorld(dt) {
    var L = G.L, cam = G.cam;
    Level.drawBackground(ctx, L, cam);
    ctx.save(); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    Level.draw(ctx, L, G.t);
    L.enemies.forEach(function (e) { Actors.drawEnemy(ctx, e, G.t); });
    Actors.drawPlayer(ctx, G.player, G.t, mood());
    G.balls.forEach(function (b) { Art.drawPaperBall(ctx, b.x, b.y, CONFIG.throw.radius, b.rot); });
    Art.drawPaperBits(ctx, G.bits);
    Actors.drawPopups(ctx, G);
    if (showBoxes) {
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'magenta';
      L.solids.forEach(function (s) { ctx.strokeRect(s.x, s.y, s.w, s.h); });
      ctx.strokeStyle = 'red'; L.hazards.forEach(function (z) { ctx.strokeRect(z.hit.x, z.hit.y, z.hit.w, z.hit.h); });
      ctx.strokeStyle = 'cyan'; [G.player].concat(L.enemies).forEach(function (b) { var r = Actors.boxOf(b); ctx.strokeRect(r.x, r.y, r.w, r.h); });
    }
    ctx.restore();
    UI.film(ctx, G.t);
    UI.hud(ctx, G, dt);
    if (G.introT > 0) UI.banner(ctx, TEXT[L.data.name] || L.data.name, null, Math.min(1, G.introT));
  }

  var titleLevel = null;
  function drawTitle() {
    if (!titleLevel) titleLevel = Level.build('level1');
    Level.drawBackground(ctx, titleLevel, { x: G.t * 20, y: 0 });
    ctx.fillStyle = 'rgba(239,232,216,0.35)'; ctx.fillRect(0, 0, W, H);
    Art.drawPuppet(ctx, W / 2, H - 70, { pose: 'idle', t: G.t, mood: mood(), facing: 1, scale: 1.1 });
    UI.film(ctx, G.t);
    UI.text(ctx, TEXT.GAME_TITLE, W / 2, 190, 84, { align: 'center', font: '"Bungee Shade", serif', weight: '400', outline: 10 });
    if (Math.floor(G.t / 0.6) % 2 === 0) UI.text(ctx, TEXT.PRESS_START, W / 2, 270, 32, { align: 'center', weight: '400', outline: 6 });
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    if (G.state === 'loading') { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H); UI.text(ctx, TEXT.LOADING, W / 2, H / 2, 32, { align: 'center', color: '#ddd' }); return; }
    if (G.state === 'title') return drawTitle();
    drawWorld(dt);
    if (G.state === 'paused') UI.banner(ctx, TEXT.PAUSED, TEXT.PAUSE_HINT);
    if (G.state === 'done') UI.banner(ctx, TEXT.LEVEL_DONE, TEXT.HUD_SCORE + ': ' + G.score + '   ·   ' + TEXT.PRESS_CONTINUE);
  }

  // ---------------- loop (fixed 60 updates per second) ----------------
  var last = performance.now(), acc = 0;
  function frame(now) {
    var dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now; acc += dt;
    while (acc >= STEP) { update(STEP); Input.endStep(); acc -= STEP; }
    draw(dt);
    requestAnimationFrame(frame);
  }

  Sound.preload(['sfx_jump', 'sfx_attack', 'sfx_hit', 'sfx_enemy_defeat', 'sfx_boss_defeat', 'sfx_pickup', 'sfx_checkpoint', 'sfx_ui']);
  var art = Art.PUPPET_PARTS.concat(Level.artList('level1'));
  Promise.all([document.fonts.ready, new Promise(function (res) { Art.loadPainted(art, res); })]).then(function () {
    G.state = 'title'; Sound.music('music_title');
  });
  window.addEventListener('keydown', function () { Sound.resume(); });   // browsers allow audio only after a key press
  requestAnimationFrame(frame);
})();
