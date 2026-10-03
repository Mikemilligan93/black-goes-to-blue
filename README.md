# Black goes to Blue

Mito Hackathon 2026 – a 1930s rubber-hose platformer about employee mental well-being.

**Play:** open `game/index.html` in Chrome. Press F for fullscreen.

| Key | Action |
| --- | --- |
| Arrows / A, D | Move |
| Space / W / Up | Jump (hold for higher) |
| X / J | Throw a paper ball |
| Esc / P | Pause |
| M | Sound on/off |

**Test mode:** open `game/index.html?debug`. Keys 1–6 bring back each colour, 0 turns them all grey, H shows collision boxes.

**Edit without coding:**
- Texts: `game/texts.js`
- Levels: `game/levels/level1.js` (letters explained in `game/levels/legend.js`)
- Tuning (speed, jump, damage…): `game/config.js`

**New art:** save Nano Banana images in `game/images/` (prompts are in the `*_PROMPTS.md` files there), then run `sh tools/make_art.sh`.
