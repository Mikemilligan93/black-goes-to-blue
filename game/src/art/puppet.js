// ============================================================
//  PLAYER PUPPET - painted Nano Banana parts + rubber-hose limbs drawn in code.
//  Art.drawPuppet(ctx, x, y, s)   (x, y = point between the feet, on the ground)
//    s.pose   : 'idle' | 'walk' | 'jump' | 'hurt'
//    s.throwT : 0..1 progress of a paper-ball throw (works with any pose), or undefined
//    s.out    : optional object; receives out.hand = world position of the throwing hand
//    s.t      : time in seconds          s.phase : walk cycle phase
//    s.vy     : vertical speed           s.facing: 1 right, -1 left
//    s.mood   : 0 burnt out .. 1 recovered   s.scale : size multiplier
//    s.face   : optional expression override ('tired', 'happy', ...)
//  All tuning numbers live in Art.PUPPET below.
// ============================================================
window.Art = window.Art || {};

Art.PUPPET = {
  size: 0.2,                        // game pixels per head-image pixel (overall size)
  outline: 2.2,                     // ink line width of the code-drawn limbs
  head:  { scale: 1.22, offset: [5, 8],
           // chin point of each head image (where it sits on the collar)
           chin: { tired: [149, 278], tired_blink: [152, 282], neutral: [176, 307], neutral_blink: [176, 305],
                   happy: [187, 320], determined: [176, 312], hurt: [179, 310], surprised: [176, 309] } },
  torso: { scale: 0.87, hip: [80, 372], neck: [96, 30], shoulder: [50, 104] },
  glove: { scale: 0.6,
           relaxed: { wrist: [92, 26], dir: Math.PI / 2 },
           fist:    { wrist: [22, 80], dir: 0 },
           open:    { wrist: [110, 288], dir: -Math.PI / 2 } },
  shoe:  { scale: 0.58, ankle: [80, 30], sole: 160 },
  leg:   { len: 52, width: 15, cuff: 18, spread: 3.5, top: 6 },  // top: how far the legs start up inside the trousers
  arm:   { len: 46, width: 12, sleeve: 0.55 },
  ball:  9,                         // paper ball radius in the hand
};

Art.RELEASE = 0.45;               // throw progress at which the ball leaves the hand

Art.PUPPET_PARTS = ['body_torso', 'body_glove_relaxed', 'body_glove_fist', 'body_glove_open', 'body_shoe',
  'heads_tired', 'heads_tired_blink', 'heads_neutral', 'heads_neutral_blink', 'heads_happy',
  'heads_determined', 'heads_hurt', 'heads_surprised'];

(function () {
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // points along a bendy limb (quadratic curve that bows out when the limb is compressed)
  function limb(ax, ay, bx, by, len, bendDir) {
    var dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
    var slack = Math.max(0, len - d);
    var cx = (ax + bx) / 2 - dy / d * bendDir * slack * 0.9;
    var cy = (ay + by) / 2 + dx / d * bendDir * slack * 0.9;
    return { a: [ax, ay], c: [cx, cy], b: [bx, by] };
  }
  function at(L, t) {
    var u = 1 - t;
    return [u * u * L.a[0] + 2 * u * t * L.c[0] + t * t * L.b[0], u * u * L.a[1] + 2 * u * t * L.c[1] + t * t * L.b[1]];
  }
  function path(ctx, L, t0, t1) {
    ctx.beginPath();
    for (var i = 0; i <= 12; i++) { var p = at(L, t0 + (t1 - t0) * i / 12); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
  }
  function stroke(ctx, L, t0, t1, w, col) {
    path(ctx, L, t0, t1); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
  }
  function shine(ctx, L, t0, t1, w) { // soft watercolour highlight along the tube
    ctx.save(); ctx.globalAlpha = 0.22; ctx.translate(-w * 0.18, -w * 0.12);
    stroke(ctx, L, t0 + 0.08, t1 - 0.08, w * 0.3, '#ffffff'); ctx.restore();
  }
  function endAngle(L) { return Math.atan2(L.b[1] - L.c[1], L.b[0] - L.c[0]); }

  function leg(ctx, L, P, dark) {
    var ink = Art.cc('pInk'), O = P.outline, lg = P.leg;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    stroke(ctx, L, 0, 1, lg.width + O * 2, ink);
    stroke(ctx, L, 0.78, 1, lg.cuff + O * 2, ink);
    stroke(ctx, L, 0, 1, lg.width, shade(Art.cc('pDenim'), dark));
    stroke(ctx, L, 0.8, 1, lg.cuff, shade(Art.cc('pDenimCuff'), dark));
    shine(ctx, L, 0, 0.78, lg.width);
  }

  function arm(ctx, L, P, glove, dark) {
    var ink = Art.cc('pInk'), O = P.outline, ar = P.arm, sl = ar.sleeve;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    stroke(ctx, L, 0, 0.97, ar.width + O * 2, ink);
    stroke(ctx, L, sl - 0.08, sl + 0.04, ar.width + 4 + O * 2, ink);
    stroke(ctx, L, 0, 0.97, ar.width, shade(Art.cc('pSkin'), dark));
    stroke(ctx, L, 0, sl, ar.width, shade(Art.cc('pSleeve'), dark));
    stroke(ctx, L, sl - 0.07, sl + 0.03, ar.width + 4, shade(Art.cc('pSleeveCuff'), dark));
    shine(ctx, L, 0, sl, ar.width);
    var g = P.glove[glove], S = P.size * P.glove.scale;
    ctx.save(); ctx.translate(L.b[0], L.b[1]); ctx.rotate(endAngle(L) - g.dir);
    Art.drawPainted(ctx, 'body_glove_' + glove, g.wrist[0], g.wrist[1], S);
    ctx.restore();
  }

  function shade(col, f) {
    if (!f || f === 1) return col;
    var m = col.charAt(0) === '#' ? Art._rgb(col) : col.match(/\d+/g).map(Number);
    return 'rgb(' + Math.round(m[0] * f) + ',' + Math.round(m[1] * f) + ',' + Math.round(m[2] * f) + ')';
  }

  Art.drawPuppet = function (ctx, x, y, s) {
    var P = Art.PUPPET, S = P.size;
    var t = s.t || 0, m = clamp(s.mood === undefined ? 0 : s.mood, 0, 1), slump = 1 - m;
    var pose = s.pose || 'idle', ph = s.phase || 0, vy = s.vy || 0;
    var hurt = pose === 'hurt', thr = s.throwT, throwing = typeof thr === 'number' && thr >= 0 && thr <= 1 && !hurt;

    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
    ctx.scale((s.facing || 1) * (s.scale || 1), s.scale || 1);
    if (pose === 'jump') { var k = clamp(-vy / 1400, -0.15, 0.2); ctx.scale(1 - k * 0.6, 1 + k); }

    var breathe = Math.sin(t * (1.6 + m * 1.4));
    var bob = pose === 'walk' ? -Math.abs(Math.sin(ph)) * (3 + m * 4) : breathe * 1.2;
    var lean = slump * 0.13 + (pose === 'walk' ? 0.05 : 0) - (hurt ? 0.22 : 0) + (throwing ? (thr < 0.35 ? -0.08 * thr / 0.35 : 0.14 * (1 - thr)) : 0);

    var shoeS = S * P.shoe.scale, ankleH = (P.shoe.sole - P.shoe.ankle[1]) * shoeS;
    var hip = { x: 0, y: -(ankleH + P.leg.len * 0.94) + bob };
    var ts = S * P.torso.scale, cl = Math.cos(lean), sn = Math.sin(lean);
    function T(p) { var dx = (p[0] - P.torso.hip[0]) * ts, dy = (p[1] - P.torso.hip[1]) * ts; return { x: hip.x + dx * cl - dy * sn, y: hip.y + dx * sn + dy * cl }; }
    var neck = T(P.torso.neck), sh = T(P.torso.shoulder);

    // ---- legs ----
    var legs = [];
    for (var i = 0; i < 2; i++) {
      var hx = hip.x + (i ? P.leg.spread : -P.leg.spread), ax, ay, tilt = 0, a = ph + i * Math.PI;
      if (pose === 'walk') { ax = hx + Math.sin(a) * (13 + m * 5); ay = -ankleH - Math.max(0, Math.cos(a)) * (6 + m * 6); tilt = Math.max(0, Math.cos(a)) * 0.25 - 0.05; }
      else if (pose === 'jump') { ax = hx + (vy < 0 ? (i ? 8 : -4) : (i ? 5 : -8)); ay = -ankleH - (vy < 0 ? 14 + i * 5 : 4); tilt = vy < 0 ? 0.3 : -0.1; }
      else if (hurt) { ax = hx - 4 + i * 10; ay = -ankleH - 2; tilt = -0.1; }
      else if (throwing) { ax = hx + (i ? 14 : -12); ay = -ankleH; }
      else { ax = hx + (i ? 6 : -4); ay = -ankleH; }
      legs.push({ L: limb(hx, hip.y - P.leg.top, ax, ay, P.leg.len + P.leg.top, -1), tilt: tilt });
    }

    // ---- arms ----
    var roots = [{ x: sh.x + 4, y: sh.y + 1 }, { x: sh.x, y: sh.y }], arms = [], AL = P.arm.len;
    for (var j = 0; j < 2; j++) {
      var r = roots[j], hx2, hy2, glove = 'relaxed', b = ph + j * Math.PI + Math.PI;
      if (pose === 'walk') { hx2 = r.x + Math.sin(b) * (11 + m * 7); hy2 = r.y + AL * 0.9 + slump * 4 - Math.abs(Math.cos(b)) * 2; }
      else if (pose === 'jump') { glove = 'open'; if (j) { hx2 = r.x + 32; hy2 = r.y + AL * 0.35; } else { hx2 = r.x - 20; hy2 = vy < 0 ? r.y - AL * 0.55 : r.y + 2; } }  // front hand forward and low, clear of the face
      else if (hurt) { glove = 'open'; hx2 = r.x + (j ? 30 : -26); hy2 = r.y - AL * (j ? 0.2 : 0.45) + Math.sin(t * 30) * 3; }
      else { hx2 = r.x + (j ? 4 : -2) + breathe; hy2 = r.y + AL * 0.92 + slump * 5; }
      if (throwing) {   // side-arm throw: wind back, whip forward, follow through
        if (j) {
          var bk = { x: r.x - AL * 0.8, y: r.y - 4 }, fw = { x: r.x + AL * 0.95, y: r.y + 18 }, e;
          if (thr < 0.35) { e = ease(thr / 0.35); hx2 += (bk.x - hx2) * e; hy2 += (bk.y - hy2) * e; glove = 'fist'; }
          else if (thr < 0.5) { e = ease((thr - 0.35) / 0.15); hx2 = bk.x + (fw.x - bk.x) * e; hy2 = bk.y + (fw.y - bk.y) * e; glove = thr < Art.RELEASE ? 'fist' : 'open'; }
          else { e = (thr - 0.5) / 0.5; hx2 = fw.x - e * 6; hy2 = fw.y + e * AL * 0.5; glove = 'open'; }
        } else { hx2 = r.x + 10; hy2 = r.y + AL * 0.6; glove = 'relaxed'; }
      }
      arms.push({ L: limb(r.x, r.y, hx2, hy2, AL, 1), glove: glove, ball: throwing && j === 1 && thr < Art.RELEASE });
    }

    // ---- head choice ----
    var face = s.face || (hurt ? 'hurt' : throwing ? 'determined' : (pose === 'jump' && vy > 350) ? 'surprised'
      : m < 0.4 ? 'tired' : m < 0.75 ? 'neutral' : 'happy');
    if ((t % 3.7) < 0.13) face = face === 'tired' ? 'tired_blink' : (face === 'neutral' || face === 'happy') ? 'neutral_blink' : face;

    // ---- draw: back arm, legs + shoes, torso, head, front arm ----
    arm(ctx, arms[0].L, P, arms[0].glove, 0.86);
    for (var q = 0; q < 2; q++) {
      ctx.save(); ctx.translate(legs[q].L.b[0], legs[q].L.b[1]); ctx.rotate(legs[q].tilt);
      Art.drawPainted(ctx, 'body_shoe', P.shoe.ankle[0], P.shoe.ankle[1], shoeS);
      ctx.restore();
      leg(ctx, legs[q].L, P, q === 0 ? 0.86 : 1);  // trouser cuff covers the top of the shoe
    }
    ctx.save(); ctx.translate(hip.x, hip.y); ctx.rotate(lean);
    Art.drawPainted(ctx, 'body_torso', P.torso.hip[0], P.torso.hip[1], ts);
    ctx.restore();
    var c = P.head.chin[face];
    ctx.save(); ctx.translate(neck.x + P.head.offset[0], neck.y + P.head.offset[1] - Math.max(0, breathe) * 0.8);
    ctx.rotate(lean * 0.6 - (hurt ? 0.15 : 0) + (pose === 'walk' ? Math.sin(ph * 2) * 0.03 : 0));
    Art.drawPainted(ctx, 'heads_' + face, c[0], c[1], S * P.head.scale);
    ctx.restore();
    arm(ctx, arms[1].L, P, arms[1].glove, 1);
    if (arms[1].ball) { var ea = endAngle(arms[1].L); Art.drawPaperBall(ctx, arms[1].L.b[0] + Math.cos(ea) * 14, arms[1].L.b[1] + Math.sin(ea) * 14 - 4, P.ball, thr * 4); }
    ctx.restore();
    if (s.out) {   // hand position in world coordinates (for spawning the projectile)
      var sc = s.scale || 1, f = s.facing || 1;
      s.out.hand = { x: x + f * sc * arms[1].L.b[0], y: y + sc * arms[1].L.b[1] };
    }
  };
  function ease(u) { return u * u * (3 - 2 * u); }
})();
