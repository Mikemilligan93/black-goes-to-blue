// ============================================================
//  CRUMPLED PAPER BALL - the player's projectile, drawn in code.
//  Art.drawPaperBall(ctx, x, y, r, rot)   Art.drawPaperBits(ctx, bits)
// ============================================================
window.Art = window.Art || {};

(function () {
  // fixed jagged outline (angle offset, radius) so every ball is the same crumpled shape
  var OUTLINE = [[0, 1.0], [0.42, 0.87], [0.8, 1.05], [1.25, 0.89], [1.55, 1.0], [1.95, 0.86], [2.35, 1.04],
                 [2.8, 0.90], [3.2, 1.02], [3.6, 0.8], [4.0, 1.06], [4.45, 0.90], [4.85, 1.0], [5.3, 0.88], [5.75, 1.03]];
  // shaded facets (triangles between outline points and inner points) and fold lines
  var FACETS = [[[0.8, 1.05], [1.25, 0.82], [1.0, 0.3]], [[2.8, 0.84], [3.2, 1.02], [3.0, 0.35]],
                [[4.45, 0.83], [4.85, 1.0], [4.6, 0.25]], [[5.75, 1.03], [0, 1.0], [0.1, 0.4]]];
  var FOLDS = [[[1.0, 0.3], [2.1, 0.2], [2.35, 1.04]], [[1.0, 0.3], [0.42, 0.78]], [[3.0, 0.35], [4.0, 0.45], [4.6, 0.25]],
               [[2.1, 0.2], [3.0, 0.35]], [[5.3, 0.79], [5.6, 0.35], [0.1, 0.4]]];
  var PAPER = '#F2EAD7', SHADE = '#CFC2A4', INK = '#2A1E16';
  function pt(p, r) { return [Math.cos(p[0]) * p[1] * r, Math.sin(p[0]) * p[1] * r]; }
  function poly(ctx, pts, r, close) {
    ctx.beginPath();
    pts.forEach(function (p, i) { var q = pt(p, r); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
    if (close) ctx.closePath();
  }

  Art.drawPaperBall = function (ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    poly(ctx, OUTLINE, r, true); ctx.fillStyle = PAPER; ctx.fill();
    ctx.fillStyle = SHADE; FACETS.forEach(function (f) { poly(ctx, f, r, true); ctx.fill(); });
    ctx.lineWidth = Math.max(0.8, r * 0.09); ctx.strokeStyle = 'rgba(42,30,22,0.7)';
    FOLDS.forEach(function (f) { poly(ctx, f, r, false); ctx.stroke(); });
    poly(ctx, OUTLINE, r, true); ctx.lineWidth = Math.max(1.5, r * 0.11); ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
  };

  // small paper flecks when a ball bursts: bits = [{x, y, rot, life}] (life 1 -> 0)
  Art.drawPaperBits = function (ctx, bits) {
    bits.forEach(function (b) {
      ctx.save(); ctx.globalAlpha = Math.max(0, b.life); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(3, -3); ctx.lineTo(2, 2); ctx.lineTo(-2, 3); ctx.closePath();
      ctx.fill(); ctx.stroke(); ctx.restore();
    });
  };
})();
