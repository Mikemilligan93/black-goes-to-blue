# Nano Banana prompts

How the art is split: Claude draws the player, enemies, bosses, platforms and UI in code.
Nano Banana makes the painted **backgrounds** behind them and the **title card frame**.

## Rules for every image

- **Generate in full colour.** The game turns the image grey in code and brings each
  colour back as bosses are defeated, so one image serves the whole colour arc.
- **Aspect ratio:** 16:9 (choose it in the aspect-ratio setting if your Nano Banana app has one;
  the prompt also asks for it).
- **No characters, no text, no logos.** Characters are drawn by the game; text comes from `texts.js`.
- **Keep the bottom fifth calm** (plain floor or ground, no objects). The game draws platforms
  there, and a busy floor makes it hard to see where you can stand.
- **Original style only.** Don't add names of existing cartoons, studios or characters to the prompts.
- If one detail is wrong, don't regenerate: ask Nano Banana to edit it, e.g.
  *"Keep everything exactly the same, but remove the clock on the left wall."*
- Save as PNG in this folder with the file name given below, then tell Claude.

## Style block (already included in the full prompts below)

> Hand-painted background art for a 1930s rubber-hose cartoon, side view, flat and theatrical
> like a stage set. Bouncy, slightly warped architecture with wobbly perspective; furniture and
> objects have soft rounded shapes, thick black ink outlines and gentle watercolour shading.
> Limited palette of brick red, warm gold, leaf green, calm teal, clear sky blue and warm peach,
> on cream paper with a subtle paper texture. Even, soft lighting. No characters, no people,
> no animals, no text, no letters, no numbers, no logos, no signature. The bottom fifth of the
> image is a plain, uncluttered floor. Wide 16:9 landscape.

## Test 1: first level background → save as `level1_bg.png`

Copy everything in the box below:

```
Hand-painted background art for a 1930s rubber-hose cartoon, side view, flat and theatrical like a stage set. Bouncy, slightly warped architecture with wobbly perspective; furniture and objects have soft rounded shapes, thick black ink outlines and gentle watercolour shading. Limited palette of brick red, warm gold, leaf green, calm teal, clear sky blue and warm peach, on cream paper with a subtle paper texture. Even, soft lighting. No characters, no people, no animals, no text, no letters, no numbers, no logos, no signature. The bottom fifth of the image is a plain, uncluttered floor. Wide 16:9 landscape. Scene: the inside of an old-fashioned open-plan office on a Monday morning.
Rows of wooden desks with bendy desk lamps and typewriters, tall wobbly stacks of paper,
filing cabinets, a big round wall clock, tall windows with a city skyline outside, potted
plants, striped wallpaper. The room feels crowded and a little tired, with the energy of a
long week ahead.
```

## Test 2: title card frame → save as `title_frame.png`

Copy everything in the box below:

```
Ornate title card frame from a 1930s cartoon short: a decorative border of curling ribbons,
rays of light from the centre and small stars, drawn with thick black ink outlines and
watercolour shading in brick red, warm gold and calm teal on cream paper. The centre is
a large empty plain cream area, completely blank, for text to be added later. No text,
no letters, no characters, no logos. Wide 16:9 landscape.
```

## What to check before sending

- Does the background read clearly behind the character in `styletest.html`? (Claude will
  load it there once you save it.)
- Is the bottom fifth calm enough for platforms?
- Does it look 1930s hand-painted rather than modern digital?
