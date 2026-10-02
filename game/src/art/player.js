// ============================================================
//  PLAYER CHARACTER - rubber-hose office worker, drawn in code.
//  Art.drawPlayer(ctx, x, y, s)
//    x, y      : point between the feet (on the ground)
//    s.pose    : 'idle' | 'walk' | 'jump' | 'hurt'
//    s.t       : time in seconds (for breathing, blinking)
//    s.phase   : walk cycle phase (grows with distance walked)
//    s.vy      : vertical speed (for jump squash and stretch)
//    s.facing  : 1 = right, -1 = left
//    s.mood    : 0 = burnt out (slumped) .. 1 = recovered (upright, smiling)
//    s.scale   : size multiplier (default 1, about 170 px tall)
// ============================================================
window.Art = window.Art || {};

(function () {
  var OUT = 3.5; // ink outline width, same everywhere for a consistent look

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // A bendy "noodle" limb with an ink outline. Bends toward `bendDir` when compressed.
  function noodle(ctx, ax, ay, bx, by, len, width, fill, bendDir) {
    var dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
    var slack = Math.max(0, len - d);
    var nx = -dy / d * bendDir, ny = dx / d * bendDir;
    var cx = (ax + bx) / 2 + nx * slack * 0.9, cy = (ay + by) / 2 + ny * slack * 0.9;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(cx, cy, bx, by);
    ctx.strokeStyle = Art.PAL.ink[0]; ctx.lineWidth = width + OUT * 2; ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = width; ctx.stroke();
  }

  function ellipse(ctx, x, y, rx, ry, fill, rot) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.lineWidth = OUT; ctx.strokeStyle = Art.PAL.ink[0]; ctx.stroke();
  }

  // Classic cartoon glove: round hand, flared cuff, three stitch lines.
  function glove(ctx, x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-5, -7); ctx.lineTo(-12, -9); ctx.lineTo(-12, 9); ctx.lineTo(-5, 7); ctx.closePath();
    ctx.fillStyle = Art.PAL.white[0]; ctx.fill(); ctx.lineWidth = OUT; ctx.strokeStyle = Art.PAL.ink[0]; ctx.stroke();
    ellipse(ctx, 4, 0, 10, 9, Art.PAL.white[0]);
    ctx.lineWidth = 1.6; ctx.beginPath();
    for (var i = -1; i <= 1; i++) { ctx.moveTo(0, i * 3.5); ctx.lineTo(7, i * 3.5); }
    ctx.stroke();
    ctx.restore();
  }

  function shoe(ctx, x, y, tilt) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ellipse(ctx, 7, -6, 17, 9, Art.PAL.ink[0]);
    ctx.beginPath(); ctx.ellipse(12, -9, 5, 2.5, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    ctx.restore();
  }

  Art.drawPlayer = function (ctx, x, y, s) {
    var t = s.t || 0, m = clamp(s.mood === undefined ? 0 : s.mood, 0, 1), slump = 1 - m;
    var pose = s.pose || 'idle', ph = s.phase || 0, vy = s.vy || 0;
    var C = Art.c, ink = Art.PAL.ink[0];

    ctx.save();
    ctx.translate(x, y);

    // ground shadow (not flipped, not stretched)
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();

    ctx.scale((s.facing || 1) * (s.scale || 1), s.scale || 1);

    // squash and stretch in the air
    if (pose === 'jump') {
      var k = clamp(-vy / 1400, -0.18, 0.22);
      ctx.scale(1 - k * 0.6, 1 + k);
    }

    var breathe = Math.sin(t * (1.6 + m * 1.4));
    var bob = pose === 'walk' ? -Math.abs(Math.sin(ph)) * (4 + m * 4) : breathe * 1.2;
    var hurt = pose === 'hurt';
    var lean = slump * 10 + (pose === 'walk' ? 4 : 0) - (hurt ? 12 : 0);

    var hip = { x: 0, y: -58 + bob };
    var sh = { x: lean, y: -106 + bob + slump * 8 - breathe * 1.2 };
    var head = { x: lean * 1.5 + 4, y: -140 + bob + slump * 12 - breathe * 1.5 };

    // ---- legs (back first) ----
    var feet = [];
    for (var i = 0; i < 2; i++) {
      var hx = hip.x + (i ? 7 : -7), fx, fy;
      if (pose === 'walk') {
        var a = ph + i * Math.PI;
        fx = hx + Math.sin(a) * (16 + m * 6);
        fy = -Math.max(0, Math.cos(a)) * (8 + m * 6);
      } else if (pose === 'jump') {
        fx = hx + (vy < 0 ? (i ? 10 : -4) : (i ? 6 : -10));
        fy = vy < 0 ? -18 - i * 6 : -6;
      } else if (hurt) {
        fx = hx - 6 + i * 14; fy = -4;
      } else {
        fx = hx + (i ? 8 : -8); fy = 0;
      }
      feet.push({ hx: hx, fx: fx, fy: fy });
      var legCol = i === 0 ? shade(C('trousers'), 0.85) : C('trousers');
      noodle(ctx, hx, hip.y, fx, fy - 9, 54, 13, legCol, -1);
      shoe(ctx, fx, fy, pose === 'walk' ? Math.cos(ph + i * Math.PI) * 0.15 : 0);
    }

    // ---- arms: compute hands ----
    var hands = [];
    for (var j = 0; j < 2; j++) {
      var sx = sh.x + (j ? 9 : -9), sy = sh.y + 6, hxx, hyy;
      if (pose === 'walk') {
        var b = ph + j * Math.PI + Math.PI;
        hxx = sx + Math.sin(b) * (14 + m * 8); hyy = sy + 44 + slump * 6 - Math.abs(Math.cos(b)) * 3;
      } else if (pose === 'jump') {
        hxx = sx + (j ? 18 : -14); hyy = vy < 0 ? sy - 34 : sy - 4;
      } else if (hurt) {
        hxx = sx + (j ? 22 : -20); hyy = sy - 30 + Math.sin(t * 30) * 4;
      } else {
        hxx = sx + (j ? 6 : -4) + breathe * 1; hyy = sy + 46 + slump * 8;
      }
      hands.push({ sx: sx, sy: sy, hx: hxx, hy: hyy });
    }
    function arm(h) {
      noodle(ctx, h.sx, h.sy, h.hx, h.hy, 48, 9, Art.PAL.white[0], 1);
      glove(ctx, h.hx, h.hy, Math.atan2(h.hy - h.sy, h.hx - h.sx));
    }
    arm(hands[0]); // back arm

    // ---- torso: shirt (pear shape) + trousers waist ----
    ctx.beginPath();
    ctx.moveTo(hip.x - 17, hip.y + 4);
    ctx.quadraticCurveTo(hip.x - 22, (hip.y + sh.y) / 2, sh.x - 13, sh.y);
    ctx.quadraticCurveTo(sh.x, sh.y - 6, sh.x + 13, sh.y);
    ctx.quadraticCurveTo(hip.x + 24, (hip.y + sh.y) / 2, hip.x + 17, hip.y + 4);
    ctx.closePath();
    ctx.fillStyle = Art.PAL.white[0]; ctx.fill();
    ctx.lineWidth = OUT; ctx.strokeStyle = ink; ctx.stroke();
    // waistband
    ctx.beginPath();
    ctx.moveTo(hip.x - 18, hip.y - 7); ctx.lineTo(hip.x + 18, hip.y - 7);
    ctx.lineTo(hip.x + 17, hip.y + 6); ctx.lineTo(hip.x - 17, hip.y + 6); ctx.closePath();
    ctx.fillStyle = C('trousers'); ctx.fill(); ctx.stroke();
    // belt buckle
    ctx.fillStyle = ink; ctx.fillRect(hip.x + 2, hip.y - 4, 7, 7);

    // ---- tie (loosened when burnt out) ----
    var kx = sh.x + 3 + slump * 3, ky = sh.y + 3 + slump * 7;
    ctx.save(); ctx.translate(kx, ky); ctx.rotate(slump * 0.35 + (pose === 'walk' ? Math.sin(ph) * 0.08 : 0));
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(3, 7); ctx.lineTo(-3, 7); ctx.closePath();
    ctx.fillStyle = C('tie'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, 7); ctx.lineTo(3, 7); ctx.lineTo(6, 34 - slump * 4); ctx.lineTo(0, 40 - slump * 4); ctx.lineTo(-6, 34 - slump * 4); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    // collar
    ctx.fillStyle = Art.PAL.white[0]; ctx.lineWidth = 2.5; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.moveTo(sh.x - 9, sh.y - 2); ctx.lineTo(kx - 1, ky + 2); ctx.lineTo(sh.x - 4, sh.y + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sh.x + 13, sh.y - 2); ctx.lineTo(kx + 3, ky + 2); ctx.lineTo(sh.x + 12, sh.y + 8); ctx.closePath(); ctx.fill(); ctx.stroke();

    // ---- head ----
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(slump * 0.22 - (hurt ? 0.25 : 0));
    // neck
    ctx.fillStyle = C('skin'); ctx.fillRect(-6, 20, 12, 12);
    // ear
    ellipse(ctx, -18, 4, 7, 9, C('skin'));
    // face
    ellipse(ctx, 0, 0, 25, 28, C('skin'));
    // hair: cap clipped to the head + tufts (messier when burnt out)
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, 25, 28, 0, 0, Math.PI * 2); ctx.clip();
    ctx.beginPath(); ctx.ellipse(-8, -24, 32, 16 + m * 2, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = C('hair'); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(0, 0, 25, 28, 0, 0, Math.PI * 2); ctx.lineWidth = OUT; ctx.strokeStyle = ink; ctx.stroke();
    var tuft = 6 + slump * 8;
    ctx.fillStyle = C('hair'); ctx.lineWidth = 2.5;
    [[-12, -24, -0.6], [-3, -28, -0.15], [6, -27, 0.35]].forEach(function (p, n) {
      var wob = Math.sin(t * 3 + n) * slump * 0.15;
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(p[2] + wob);
      ctx.beginPath(); ctx.moveTo(-4, 2); ctx.quadraticCurveTo(-2, -tuft, 2, -tuft - 2); ctx.quadraticCurveTo(1, -tuft / 2, 4, 2); ctx.closePath();
      ctx.fill(); ctx.stroke(); ctx.restore();
    });

    // eyes
    var blink = (t % 4.3) < 0.12;
    [[5, -4], [17, -4]].forEach(function (e) {
      if (hurt) {
        ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(e[0] - 5, e[1] - 5); ctx.lineTo(e[0] + 3, e[1]); ctx.lineTo(e[0] - 5, e[1] + 5); ctx.stroke();
        return;
      }
      ellipse(ctx, e[0], e[1], 6.5, 9, Art.PAL.white[0]);
      // pie-cut pupil
      ctx.save(); ctx.beginPath(); ctx.ellipse(e[0], e[1], 6.5, 9, 0, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath(); ctx.ellipse(e[0] + 2, e[1] + 1.5 + slump * 2, 3.8, 6, 0, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
      ctx.beginPath(); ctx.moveTo(e[0] + 2, e[1] + 1); ctx.lineTo(e[0] + 7, e[1] - 6); ctx.lineTo(e[0] + 2.5, e[1] - 7); ctx.closePath();
      ctx.fillStyle = Art.PAL.white[0]; ctx.fill();
      // eyelid: heavier when burnt out
      var lid = blink ? 1 : 0.12 + slump * 0.42;
      var lidY = e[1] - 9 + 18 * lid;
      ctx.fillStyle = C('skin'); ctx.fillRect(e[0] - 8, e[1] - 10, 16, lidY - (e[1] - 10));
      ctx.beginPath(); ctx.moveTo(e[0] - 8, lidY); ctx.lineTo(e[0] + 8, lidY); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(e[0], e[1], 6.5, 9, 0, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke();
      // tired bags
      if (slump > 0.2) {
        ctx.beginPath(); ctx.arc(e[0], e[1] + 8, 5, 0.3, Math.PI - 0.3);
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(27,26,23,' + (slump * 0.6) + ')'; ctx.stroke();
      }
    });
    // nose
    ellipse(ctx, 25, 5, 6, 5, C('skinShade'));
    // mouth: frown when burnt out, smile when recovered
    ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.beginPath();
    if (hurt) { ctx.ellipse(13, 16, 4, 5, 0, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill(); }
    else { ctx.moveTo(6, 16); ctx.quadraticCurveTo(13, 16 + (m * 2 - 1) * 7, 21, 14); ctx.stroke(); }
    ctx.restore();

    arm(hands[1]); // front arm on top
    ctx.restore();
  };

  function shade(col, f) {
    var m = col.match(/\d+/g);
    if (!m) { var r = Art._rgb(col); m = r; }
    return 'rgb(' + Math.round(m[0] * f) + ',' + Math.round(m[1] * f) + ',' + Math.round(m[2] * f) + ')';
  }
})();
