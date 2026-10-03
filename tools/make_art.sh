#!/bin/sh
# Re-run after saving new Nano Banana images: cuts the parts out and builds the colour layers.
cd "$(dirname "$0")/.."
I=game/images
[ -f $I/char_heads.png ] && python3 tools/cut_parts.py $I/char_heads.png heads tired tired_blink neutral neutral_blink happy determined hurt surprised
[ -f $I/char_body.png ] && python3 tools/cut_parts.py $I/char_body.png body torso glove_relaxed glove_fist glove_open shoe
[ -f $I/props_platforms.png ] && python3 tools/cut_parts.py $I/props_platforms.png props desk cabinet shelf boxes
[ -f $I/props_misc.png ] && python3 tools/cut_parts.py $I/props_misc.png props coffee papers cooler envelope envelope_hit
python3 tools/build_art.py
