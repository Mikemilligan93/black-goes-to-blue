// ============================================================
//  ACTORS: player, enemies, paper balls, paper bits, pop-up texts.
// ============================================================
window.Actors = (function () {
  var INK = '#2A1E16';
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function boxOf(b) { return { x: b.x - b.w / 2, y: b.y - b.h, w: b.w, h: b.h }; }
  function solidAt(px, py, solids) {
    return solids.some(function (s) { return px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h; });
  }

  // Move a body (x = centre, y = feet) through the level, resolving X then Y.
  function moveBody(b, solids, dt) {
    b.onGround = false; b.hitWall = false;
    b.x += b.vx * dt;
    var bx = boxOf(b);
    solids.forEach(function (s) {
      if (s.oneway || !overlap(bx, s)) return;
      if (b.x < s.x + s.w / 2) b.x = s.x - b.w / 2; else b.x = s.x + s.w + b.w / 2;
      b.vx = 0; b.hitWall = true; bx = boxOf(b);
    });
    var prev = b.y;
    b.y += b.vy * dt; bx = boxOf(b);
    solids.forEach(function (s) {
      if (!overlap(bx, s)) return;
      if (b.vy >= 0 && prev <= s.y + 1) { b.y = s.y; b.vy = 0; b.onGround = true; }
      else if (!s.oneway && b.vy < 0 && prev - b.h >= s.y + s.h - 1) { b.y = s.y + s.h + b.h; b.vy = 0; }
      bx = boxOf(b);
    });
  }

  // ---------------- player ----------------
  function makePlayer(x, y) {
    var P = CONFIG.player;
    return { x: x, y: y, vx: 0, vy: 0, w: P.width, h: P.height, facing: 1, onGround: false, coyote: 0, buffer: 0,
             phase: 0, health: CONFIG.health.max, invuln: 0, hurtT: 0, throwT: -1, released: false, cool: 0,
             out: {}, respawn: { x: x, y: y } };
  }

  function updatePlayer(p, L, dt, G) {
    var P = CONFIG.player, I = Input;
    p.invuln = Math.max(0, p.invuln - dt); p.hurtT = Math.max(0, p.hurtT - dt); p.cool = Math.max(0, p.cool - dt);
    var control = p.hurtT <= 0;
    var dir = control ? (I.held('right') ? 1 : 0) - (I.held('left') ? 1 : 0) : 0;
    var acc = P.accel * (p.onGround ? 1 : P.airControl);
    if (dir) {
      p.vx += dir * acc * dt * (Math.sign(p.vx) === -dir ? 1.8 : 1);   // turn around quickly
      p.facing = dir;
    } else if (p.onGround && control) {
      var f = P.friction * dt; p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }
    if (control) p.vx = clamp(p.vx, -P.speed, P.speed);

    // jumping (with coyote time and jump buffer for a forgiving feel)
    p.buffer = control && I.hit('jump') ? P.jumpBuffer : p.buffer - dt;
    p.coyote = p.onGround ? P.coyoteTime : p.coyote - dt;
    if (p.buffer > 0 && p.coyote > 0) { p.vy = -P.jump; p.buffer = 0; p.coyote = 0; Sound.play('sfx_jump'); }
    if (!I.held('jump') && p.vy < -P.jumpCut && p.hurtT <= 0) p.vy = -P.jumpCut;
    p.vy = Math.min(P.maxFall, p.vy + P.gravity * dt);

    var wasGround = p.onGround;
    moveBody(p, L.solids, dt);
    if (p.onGround && !wasGround && p.vy === 0) p.landT = 0.12;
    p.x = clamp(p.x, p.w / 2, L.w - p.w / 2);
    if (p.onGround) p.phase += Math.abs(p.vx) * dt / (17 * P.scale);

    // throwing paper balls
    var TH = CONFIG.throw;
    if (control && I.hit('throw') && p.throwT < 0 && p.cool <= 0) { p.throwT = 0; p.released = false; }
    if (p.throwT >= 0) {
      p.throwT += dt / TH.time;
      if (!p.released && p.throwT >= Art.RELEASE && p.out.hand) {
        G.balls.push({ x: p.out.hand.x, y: p.out.hand.y, vx: p.facing * TH.speed + p.vx * 0.5, vy: -TH.up, rot: 0, spin: p.facing * 14 });
        p.released = true; Sound.play('sfx_attack');
      }
      if (p.throwT > 1) { p.throwT = -1; p.cool = TH.cooldown; }
    }
    if (p.y > L.h + 200) G.hurtPlayer(CONFIG.health.pit, null, true);   // fell into a pit
  }

  function drawPlayer(ctx, p, t, mood) {
    var pose = p.hurtT > 0 ? 'hurt' : !p.onGround ? 'jump' : Math.abs(p.vx) > 20 ? 'walk' : 'idle';
    ctx.save();
    if (p.invuln > 0 && Math.floor(t * 12) % 2) ctx.globalAlpha = 0.45;
    Art.drawPuppet(ctx, p.x, p.y, { pose: pose, t: t, phase: p.phase, vy: p.vy, facing: p.facing, mood: mood,
      throwT: p.throwT >= 0 ? p.throwT : undefined, out: p.out, scale: CONFIG.player.scale });
    ctx.restore();
  }

  // ---------------- enemies (test enemy: angry envelope) ----------------
  function makeEnemy(x, y, kind) {
    return { kind: kind, x: x, y: y, vx: 0, vy: 0, w: 56, h: 84, dir: -1, hp: CONFIG.enemy.hits, hitT: 0, dead: false, t: Math.random() * 5 };
  }

  function updateEnemy(e, L, dt, G) {
    if (e.dead) return;
    e.t += dt; e.hitT = Math.max(0, e.hitT - dt);
    if (e.hitT <= 0) e.vx = e.dir * CONFIG.enemy.speed; else e.vx *= 0.92;
    e.vy = Math.min(1200, e.vy + CONFIG.player.gravity * dt);
    moveBody(e, L.solids, dt);
    if (e.hitWall) e.dir *= -1;
    if (e.onGround && e.hitT <= 0 && !solidAt(e.x + e.dir * (e.w / 2 + 4), e.y + 6, L.solids)) e.dir *= -1;  // turn at edges
    if (e.y > L.h + 200) e.dead = true;
    if (overlap(boxOf(e), boxOf(G.player))) G.hurtPlayer(CONFIG.health.enemyHit, e.x);
  }

  function drawEnemy(ctx, e, t) {
    if (e.dead) return;
    var ph = e.t * 11, bob = Math.abs(Math.sin(ph)) * 3, hit = e.hitT > 0;
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(1.55, 1.55);
    // legs (always code-drawn, rubber-hose noodles)
    ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = 3.5; ctx.fillStyle = INK;
    for (var i = 0; i < 2; i++) {
      var fx = (i ? 8 : -8) + Math.sin(ph + i * Math.PI) * 7, fy = -Math.max(0, Math.cos(ph + i * Math.PI)) * 5;
      ctx.beginPath(); ctx.moveTo(i ? 7 : -7, -12 - bob); ctx.quadraticCurveTo((i ? 7 : -7) + 4, -6, fx, fy - 3); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(fx + e.dir * 3, fy - 3, 6, 3.5, 0, 0, 7); ctx.fill();
    }
    ctx.translate(0, -12 - bob); ctx.scale(1 / 1.55, 1 / 1.55);
    if (hit && Math.floor(t * 20) % 2) ctx.globalAlpha = 0.6;
    ctx.scale(1.6, 1.6);
    var art = hit ? 'props_envelope_hit' : 'props_envelope';
    if (Level.painted(art)) {
      var m = ART_MANIFEST[art], sc = 40 / m.h;
      if (e.dir > 0) ctx.scale(-1, 1);                    // art faces left
      Art.drawPainted(ctx, art, m.w / 2, m.h, sc);
    } else {
      if (e.dir > 0) ctx.scale(-1, 1);
      ctx.beginPath(); ctx.roundRect(-24, -32, 48, 32, 4); ctx.fillStyle = Art.PAL.white[0]; ctx.fill();
      ctx.lineWidth = 3; ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-24, -32); ctx.lineTo(0, -12); ctx.lineTo(24, -32); ctx.stroke();
      if (hit) { ctx.font = '700 14px serif'; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('@ @', -6, -16); }
      else {
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-14, -18, 3, 0, 7); ctx.arc(-4, -18, 3, 0, 7); ctx.fill();
        ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-19, -26); ctx.lineTo(-11, -23); ctx.moveTo(1, -26); ctx.lineTo(-7, -23); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------------- paper balls, bits, pop-ups ----------------
  function burst(G, x, y, n) {
    for (var i = 0; i < (n || 7); i++)
      G.bits.push({ x: x, y: y, vx: (Math.random() - 0.5) * 260, vy: -120 - Math.random() * 200, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 20, life: 1 });
  }

  function updateBalls(G, L, dt) {
    var TH = CONFIG.throw, r = TH.radius;
    G.balls = G.balls.filter(function (b) {
      b.vy += TH.gravity * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.spin * dt;
      var bb = { x: b.x - r, y: b.y - r, w: r * 2, h: r * 2 };
      if (G.boss && Bosses[G.boss.kind].hit(G.boss, b, G)) { Actors.burst(G, b.x, b.y, 5); return false; }
      for (var i = 0; i < L.enemies.length; i++) {
        var e = L.enemies[i];
        if (e.dead || !overlap(bb, boxOf(e))) continue;
        e.hp--; e.hitT = 0.35; e.vy = -220; e.vx = Math.sign(b.vx) * 120;
        burst(G, b.x, b.y, 5);
        if (e.hp <= 0) {
          e.dead = true; burst(G, e.x, e.y - 20, 12);
          G.score += CONFIG.enemy.score; popup(G, e.x, e.y - 60, '+' + CONFIG.enemy.score);
          Sound.play('sfx_enemy_defeat');
        }
        return false;
      }
      var hitSolid = L.solids.some(function (s) { return (!s.oneway || b.vy > 0 && b.y - b.vy * dt <= s.y) && overlap(bb, s); });
      if (hitSolid) { burst(G, b.x, b.y); return false; }
      return b.y < L.h + 50 && Math.abs(b.x - G.player.x) < CONFIG.width * 1.2;
    });
    G.bits = G.bits.filter(function (b) {
      b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.spin * dt; b.life -= dt * 1.6;
      return b.life > 0;
    });
    G.popups = G.popups.filter(function (p) { p.y -= 40 * dt; p.life -= dt / p.dur; return p.life > 0; });
  }

  function popup(G, x, y, text, dur) { G.popups.push({ x: x, y: y, text: text, life: 1, dur: dur || 1.2 }); }

  function drawPopups(ctx, G) {
    ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 24px "Playfair Display", serif'; ctx.lineJoin = 'round';
    G.popups.forEach(function (p) {
      ctx.globalAlpha = Math.min(1, p.life * 3);
      var w = ctx.measureText(p.text).width + 28;
      ctx.beginPath(); ctx.roundRect(p.x - w / 2, p.y - 26, w, 36, 8);
      ctx.fillStyle = 'rgba(239,232,216,0.95)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillText(p.text, p.x, p.y);
    });
    ctx.restore();
  }

  return { overlap: overlap, boxOf: boxOf, moveBody: moveBody, makePlayer: makePlayer, updatePlayer: updatePlayer,
           drawPlayer: drawPlayer, makeEnemy: makeEnemy, updateEnemy: updateEnemy, drawEnemy: drawEnemy,
           updateBalls: updateBalls, popup: popup, drawPopups: drawPopups, burst: burst };
})();
