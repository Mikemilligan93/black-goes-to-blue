// ============================================================
//  GAME TUNING. Numbers only; safe to experiment with.
//  Reload the game after a change.
// ============================================================
window.CONFIG = {
  width: 1280,            // internal resolution
  height: 720,
  fps: 60,
  tile: 40,               // size of one letter in the level maps, in pixels

  player: {
    scale: 0.8,           // character size
    width: 34,            // collision box
    height: 148,
    speed: 300,           // top running speed
    accel: 2600,          // how fast it reaches top speed
    friction: 3000,       // how fast it stops on the ground
    airControl: 0.7,      // steering in the air (0..1)
    jump: 900,            // jump strength (about 3.5 tiles high)
    jumpCut: 320,         // releasing jump early makes a shorter hop
    gravity: 2600,
    maxFall: 1200,
    coyoteTime: 0.1,      // can still jump this long after walking off an edge
    jumpBuffer: 0.12,     // jump pressed just before landing still counts
  },

  throw: {
    time: 0.32,           // length of the throwing animation
    speed: 760,           // ball speed
    up: 90,               // upward kick (makes the arc)
    gravity: 1100,
    radius: 9,
    cooldown: 0.12,       // pause between throws
  },

  health: {
    max: 100,
    enemyHit: 15,         // damage from touching an enemy
    coffee: 10,           // damage from hazards
    papers: 10,
    pit: 20,              // falling into a pit
    invulnerable: 1.2,    // seconds of safety after a hit
    respawnHealth: 60,    // health after the bar runs empty
  },

  enemy: {
    speed: 70,
    hits: 2,              // paper balls needed to defeat one
    score: 100,
    knockback: 260,       // how hard an enemy pushes the player away
  },

  camera: {
    lead: 140,            // looks ahead in the walking direction
    smooth: 6,            // higher = snappier camera
  },

  backgroundParallax: 0.25, // how fast the painted background scrolls compared to the level
  filmEffect: true,
};
