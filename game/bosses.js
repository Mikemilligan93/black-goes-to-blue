// ============================================================
//  BOSS SETTINGS. Numbers only; safe to experiment with.
// ============================================================
window.BOSSES = {

  hydra: {                 // Level 1: The Inbox Hydra
    name: 'BOSS_1_NAME',   // key in texts.js
    colour: 'teal',        // colour group it gives back (Calm teal)
    quote: 'boss1',        // quote id in quotes.js
    headHits: 4,           // paper balls to knock out one head
    regrow: true,          // the first head knocked out grows back once
    regrowDelay: 2.5,      // seconds before it grows back
    lungeDamage: 15,
    letterDamage: 10,
    lungeReach: 620,       // how far a head can lunge from its neck stump
    windup: 0.7,           // warning time before a lunge (higher = easier)
    pause: 0.9,            // pause between attacks ...
    pausePerHead: 0.55,    // ... plus this much for each head still fighting (fewer heads = faster)
    headScore: 250,
    defeatScore: 1000,
    arenaWidth: 880,       // how far right the player can go in the arena (pixels)
  },

};
