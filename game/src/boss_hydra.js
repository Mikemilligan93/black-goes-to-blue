// ============================================================
//  BOSS 1: THE INBOX HYDRA
//  Painted body + three painted heads on long code-drawn necks.
//  Heads take turns: lunge (with a warning wind-up) or spit letters.
//  The first head knocked out grows back once. Settings: bosses.js
// ============================================================
window.Bosses = window.Bosses || {};

Bosses.hydra = (function () {
  var INK = '#2A1E16', NECK = '#EADFC6', STRING = '#8A5A2E';
  var BODY = 'boss_hydra_body', LETTER = 'boss_hydra_letter';
  var FACES = { open: 'boss_hydra_head_open', smug: 'boss_hydra_head_smug', dizzy: 'boss_hydra_head_dizzy' };
  var BODY_ANCHOR = [334, 468], BODY_SCALE = 0.56;                 // bottom-centre of the painted heap
  var STUMPS = [[121, 83], [254, 29], [412, 104]];                 // neck openings on the painted body
  var HOME = [[-240, 0], [-160, -20], [-110, -10]];              // where each head rests, relative to its stump
  var HEAD_SCALE = 0.37, NECK_AT = [0.36, 0.12];                   // neck joins the head right of its centre
  var HEAD_BOX = { w: 110, h: 90 };

  function ease(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function lerp(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
  function C() { return BOSSES.hydra; }

  function create(arena) {
    var bx = arena.x + 1060, by = arena.floor;
    var b = { kind: 'hydra', arena: arena, x: bx, y: by, heads: [], letters: [], timer: 2.2, regrowUsed: false,
              state: 'fight', t: 0, dieT: 0, gone: false };
    STUMPS.forEach(function (s, i) {
      var stump = { x: bx + (s[0] - BODY_ANCHOR[0]) * BODY_SCALE, y: by + (s[1] - BODY_ANCHOR[1]) * BODY_SCALE };
      var home = { x: stump.x + HOME[i][0], y: stump.y + HOME[i][1] };
      b.heads.push({ i: i, stump: stump, home: home, x: home.x, y: home.y, hp: C().headHits, state: 'idle', st: 0,
                     flash: 0, face: 'smug', grow: 1, regrow: false });
    });
    return b;
  }

  function fighting(h) { return h.state !== 'dizzy' && h.state !== 'growing'; }
  function headBox(h) { return { x: h.x - HEAD_BOX.w / 2, y: h.y - HEAD_BOX.h / 2, w: HEAD_BOX.w, h: HEAD_BOX.h }; }

  function remaining(b) {   // hit points left, for the boss bar
    var n = 0;
    b.heads.forEach(function (h) { if (fighting(h)) n += h.hp; if (h.regrow) n += C().headHits; });
    if (C().regrow && !b.regrowUsed) n += C().headHits;
    return n;
  }
  function total() { return C().headHits * (3 + (C().regrow ? 1 : 0)); }

  function update(b, G, dt) {
    var p = G.player, cfg = C();
    b.t += dt;
    if (b.state === 'dying') {
      b.dieT += dt;
      if (b.dieT > 1.4 && !b.gone) {
        b.gone = true;
        for (var k = 0; k < 4; k++) Actors.burst(G, b.x - 120 + k * 80, b.y - 120, 14);
      }
      return;
    }
    var active = b.heads.filter(function (h) { return fighting(h); });

    // choose the next attack
    b.timer -= dt;
    if (b.timer <= 0) {
      var idle = active.filter(function (h) { return h.state === 'idle'; });
      if (idle.length) {
        var h0 = idle[Math.floor(Math.random() * idle.length)];
        var near = Math.abs(p.x - h0.stump.x) < cfg.lungeReach;
        h0.state = near && Math.random() < 0.6 ? 'windup' : 'spit'; h0.st = 0; h0.spat = false;
      }
      b.timer = cfg.pause + cfg.pausePerHead * active.length;
    }

    b.heads.forEach(function (h) {
      h.st += dt; h.flash = Math.max(0, h.flash - dt);
      var sway = { x: Math.sin(b.t * 1.3 + h.i * 2) * 14, y: Math.cos(b.t * 1.7 + h.i) * 10 };
      var rest = { x: h.home.x + sway.x, y: h.home.y + sway.y }, target = rest, follow = 6;
      h.face = 'smug';
      if (h.state === 'windup') {
        h.face = 'open';
        target = { x: h.home.x + 45 + Math.sin(b.t * 60) * 4, y: h.home.y - 55 }; follow = 8;
        if (h.st > cfg.windup) {
          h.state = 'lunge'; h.st = 0; h.from = { x: h.x, y: h.y };
          var tx = p.x, ty = p.y - 80, dx = tx - h.stump.x, dy = ty - h.stump.y, d = Math.hypot(dx, dy);
          if (d > cfg.lungeReach) { tx = h.stump.x + dx / d * cfg.lungeReach; ty = h.stump.y + dy / d * cfg.lungeReach; }
          h.to = { x: tx, y: Math.min(ty, b.y - 50) };
          Sound.play('sfx_boss_lunge');
        }
      } else if (h.state === 'lunge') {
        h.face = 'open'; var q = lerp(h.from, h.to, ease(h.st / 0.28)); h.x = q.x; h.y = q.y; target = null;
        if (h.st > 0.28) { h.state = 'recover'; h.st = 0; h.from = { x: h.x, y: h.y }; }
      } else if (h.state === 'recover') {
        var q2 = lerp(h.from, rest, ease(h.st / 0.75)); h.x = q2.x; h.y = q2.y; target = null;
        if (h.st > 0.75) h.state = 'idle';
      } else if (h.state === 'spit') {
        h.face = 'open'; target = { x: h.home.x + 25, y: h.home.y - 30 };
        if (h.st > 0.45 && !h.spat) {
          h.spat = true;
          var T = 1.0, sx = h.x - 50, sy = h.y + 10;
          b.letters.push({ x: sx, y: sy, vx: (p.x - sx) / T, vy: (p.y - 60 - sy) / T - 0.5 * 900 * T, rot: 0 });
          Sound.play('sfx_boss_spit');
        }
        if (h.st > 0.8) h.state = 'idle';
      } else if (h.state === 'dizzy') {
        h.face = 'dizzy'; target = { x: h.stump.x - 90 - h.i * 25, y: b.y - 45 }; follow = 3;
        if (h.regrow && h.st > cfg.regrowDelay) {
          Actors.burst(G, h.x, h.y, 10);
          h.regrow = false; h.state = 'growing'; h.st = 0; h.hp = cfg.headHits; h.x = h.stump.x; h.y = h.stump.y;
        }
      } else if (h.state === 'growing') {
        var k2 = ease(h.st / 1.2); h.grow = k2; var q3 = lerp(h.stump, rest, k2); h.x = q3.x; h.y = q3.y; target = null;
        if (h.st > 1.2) { h.state = 'idle'; h.grow = 1; }
      }
      if (target) { var f = Math.min(1, dt * follow); h.x += (target.x - h.x) * f; h.y += (target.y - h.y) * f; }
      // a lunging head hurts on contact
      if ((h.state === 'lunge' || (h.state === 'recover' && h.st < 0.25)) && Actors.overlap(headBox(h), Actors.boxOf(p)))
        G.hurtPlayer(cfg.lungeDamage, h.x);
    });

    // letters
    b.letters = b.letters.filter(function (l) {
      l.vy += 900 * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += dt * 6;
      if (Actors.overlap({ x: l.x - 20, y: l.y - 14, w: 40, h: 28 }, Actors.boxOf(p))) { G.hurtPlayer(cfg.letterDamage, l.x); return false; }
      if (l.y > b.y - 8) { Actors.burst(G, l.x, b.y - 8, 5); return false; }
      return true;
    });

    // all heads down for good?
    if (b.heads.every(function (h) { return h.state === 'dizzy' && !h.regrow; }) && (b.regrowUsed || !cfg.regrow)) {
      b.state = 'dying'; b.dieT = 0; b.letters = [];
      G.score += cfg.defeatScore; Actors.popup(G, b.x - 200, b.y - 300, '+' + cfg.defeatScore, 2);
      Sound.play('sfx_boss_defeat');
    }
  }

  // a paper ball hits? returns true when the ball is used up
  function hit(b, ball, G) {
    if (b.state !== 'fight') return false;
    var r = CONFIG.throw.radius, bb = { x: ball.x - r, y: ball.y - r, w: r * 2, h: r * 2 };
    for (var i = 0; i < b.heads.length; i++) {
      var h = b.heads[i];
      if (!fighting(h) || !Actors.overlap(bb, headBox(h))) continue;
      h.hp--; h.flash = 0.15; h.x += 14; Sound.play('sfx_hit', 0.4);
      if (h.hp <= 0) {
        h.state = 'dizzy'; h.st = 0;
        if (C().regrow && !b.regrowUsed) { b.regrowUsed = true; h.regrow = true; }
        G.score += C().headScore; Actors.popup(G, h.x, h.y - 70, '+' + C().headScore);
        Sound.play('sfx_enemy_defeat');
      }
      return true;
    }
    // the body soaks up balls
    var body = { x: b.x - 170, y: b.y - 230, w: 340, h: 230 };
    return Actors.overlap(bb, body);
  }

  function drawNeck(ctx, from, to, grow) {
    var c = { x: (from.x + to.x) / 2 + 25, y: Math.min(from.y, to.y) - 50 };
    function at(t) { var u = 1 - t; return { x: u * u * from.x + 2 * u * t * c.x + t * t * to.x, y: u * u * from.y + 2 * u * t * c.y + t * t * to.y }; }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [[40, INK], [32, NECK]].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(from.x, from.y);
      for (var i = 1; i <= 16; i++) { var q = at(i / 16 * grow); ctx.lineTo(q.x, q.y); }
      ctx.lineWidth = s[0]; ctx.strokeStyle = s[1]; ctx.stroke();
    });
    ctx.strokeStyle = STRING; ctx.lineWidth = 3;   // string ties around the neck
    [0.3, 0.62].forEach(function (t) {
      if (t > grow) return;
      var a = at(t), b2 = at(t + 0.02), ang = Math.atan2(b2.y - a.y, b2.x - a.x) + Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(a.x - Math.cos(ang) * 16, a.y - Math.sin(ang) * 16); ctx.lineTo(a.x + Math.cos(ang) * 16, a.y + Math.sin(ang) * 16); ctx.stroke();
    });
  }

  function draw(ctx, b, t) {
    var fade = b.state === 'dying' ? Math.max(0, 1 - (b.dieT - 1.2) / 0.5) : 1;
    if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade;
    if (b.state === 'dying') ctx.translate(Math.sin(t * 50) * 6, 0);
    ctx.save(); ctx.translate(b.x, b.y); Art.drawPainted(ctx, BODY, BODY_ANCHOR[0], BODY_ANCHOR[1], BODY_SCALE); ctx.restore();
    [2, 1, 0].forEach(function (i) {
      var h = b.heads[i], name = FACES[h.face], m = ART_MANIFEST[name], sc = HEAD_SCALE * (0.3 + 0.7 * h.grow);
      var neckPt = { x: h.x + NECK_AT[0] * m.w * sc, y: h.y + NECK_AT[1] * m.h * sc };
      drawNeck(ctx, h.stump, neckPt, h.state === 'growing' ? h.grow : 1);
      ctx.save(); ctx.translate(h.x, h.y);
      if (h.flash > 0) ctx.globalAlpha *= 0.55;
      Art.drawPainted(ctx, name, m.w / 2, m.h / 2, sc);
      ctx.restore();
    });
    b.letters.forEach(function (l) {
      var m = ART_MANIFEST[LETTER];
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.sin(l.rot) * 0.4);
      Art.drawPainted(ctx, LETTER, m.w / 2, m.h / 2, 0.24); ctx.restore();
    });
    ctx.restore();
  }

  return { create: create, update: update, hit: hit, draw: draw, remaining: remaining, total: total,
           art: [BODY, LETTER, FACES.open, FACES.smug, FACES.dizzy], settings: C };
})();
