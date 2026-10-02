#!/bin/sh
# Re-run after saving new Nano Banana images: cuts the parts out and builds the colour layers.
cd "$(dirname "$0")/.."
python3 tools/cut_parts.py game/images/char_heads.png heads tired tired_blink neutral neutral_blink happy determined hurt surprised
python3 tools/cut_parts.py game/images/char_body.png body torso glove_relaxed glove_fist glove_open shoe
python3 tools/build_art.py
