# Props: Nano Banana prompts

Props are the things you stand on, avoid or touch in a level. Like the character parts, they are
painted on flat green so the game can cut them out. Attach `level1_bg.png` as the style reference.

Rules (same as the character parts):
- one even flat green background (#00FF00), no texture, no shadows on the ground
- parts spread out, nothing touching, nothing cut off at the image edge
- straight side view, no perspective, every bottom edge flat and level (they stand on the floor)
- nothing green on the props themselves (use other colours for plants, cabinets etc.)

## Sheet 1: platforms → save as `props_platforms.png`

```
Using the attached image as the exact style reference (thick black ink outlines, gentle watercolour shading, the same colours), draw four separate 1930s rubber-hose cartoon office props, side by side in one row with plenty of empty space between them, nothing touching. Straight-on side view with no perspective, each with a flat level bottom edge as if standing on the floor, and a flat, clear top surface someone could stand on (nothing placed on top):
1. a wide wooden office desk with drawers,
2. a tall grey-blue metal filing cabinet with four drawers,
3. a low wooden bookshelf filled with red and blue binders,
4. a stack of three cardboard archive boxes.
Background: perfectly flat solid bright green (#00FF00), no texture, no shadows, no gradient. No people, no text, no letters, no numbers, no labels.
```

## Sheet 2: hazards, checkpoint and test enemy → save as `props_misc.png`

```
Using the attached image as the exact style reference (thick black ink outlines, gentle watercolour shading, the same colours), draw five separate 1930s rubber-hose cartoon objects, spread out in one row with plenty of empty space between them, nothing touching. Straight-on side view, flat level bottom edges:
1. a wide, flat puddle of spilled brown coffee on the floor with a tipped-over white mug,
2. a messy, spiky pile of overdue papers and folders with red marks on them,
3. an old-fashioned office water cooler with a big light-blue water bottle on top,
4. a small cartoon monster made from an angry paper envelope (a letter), side view facing left, with an angry face, two small arms, and no legs,
5. the same envelope monster, dizzy and squashed after being hit, with spiral eyes.
Background: perfectly flat solid bright green (#00FF00), no texture, no shadows, no gradient. No people, no text, no letters, no numbers, no labels.
```

After saving, ask Claude to run the cut-out (or run `sh tools/make_art.sh`).
