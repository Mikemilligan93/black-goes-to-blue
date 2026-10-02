# Player character: Nano Banana prompts

The character is a **puppet**: Nano Banana paints the parts (head, torso, hands, shoes) in the
same style as the background; Claude cuts them out and animates them in code, drawing the bendy
rubber-hose arms and legs between them.

We go in two rounds:

1. **Design round (now):** find the character. Generate several versions, pick one.
2. **Parts round (next):** using the picked image as a reference, generate the parts and expressions.

---

## Round 1: design → save your favourite as `char_design.png`

Generate the prompt below **3–4 times** and look at the variety. If you like one but want a
change, ask Nano Banana to edit it (e.g. *"Same character, but make the head even bigger"*).
Attach `level1_bg.png` as a style reference if your app allows it.

```
Character model sheet for an original 1930s rubber-hose cartoon character, painted in the same style as the attached background: thick black ink outlines, gentle watercolour shading, cream paper texture.

The character is a gender-neutral young office worker, the hero of a game about recovering from burnout. Classic rubber-hose design: a big round head about one third of the total height, pie-cut eyes (black oval pupils with a small wedge cut out), a round button nose, a wide expressive mouth, a short rounded haircut with one curl sticking up. A small bean-shaped body. Thin bendy noodle arms and legs with no elbows or knees, white four-fingered cartoon gloves, big round shiny shoes. Clothes: collared shirt with rolled-up sleeves, a knitted sweater vest, high-waisted trousers, and an office ID badge on a lanyard. Colours: warm peach skin, brick-red sweater vest, clear-sky-blue trousers, warm gold badge, dark brown hair. No green anywhere on the character.

Show the same character three times, side by side, full body, on a plain cream background:
1. side view facing right, burnt out: slumped shoulders, head hanging, heavy tired eyelids, dark circles under the eyes, messy hair, tiny frown;
2. side view facing right, neutral and standing straight;
3. side view facing right, recovered: upright, bouncy, big happy smile, bright open eyes.

Same proportions and clothes in all three. No text, no labels, no logos, no other characters.
```

### What to look for when picking

- Reads clearly at small size (squint: can you still see the face and pose?)
- Feels rubber-hose: big head, round shapes, bendy limbs, gloves, big shoes
- Original: it must not look like any existing cartoon character
- Face expressions you like in all three states

---

## Round 2: parts (attach `char_design.png` as the reference image for every prompt)

All parts are painted on a **flat bright green background** so the game can cut them out.
The character has no green on it, so nothing else gets removed by mistake.

Check before saving:

- the background is one even green: no paper texture, no shadows, no gradient
- parts don't touch or overlap each other, and nothing is cut off at the image edge
- the style matches the reference: same ink lines, same watercolour shading, same colours

If one part is wrong, ask Nano Banana to fix just that part instead of regenerating.

### 2a. Heads → save as `char_heads.png`

```
Using the attached character as the exact reference (same face, hair, colours, ink lines and watercolour style), draw ONLY the character's head, eight times, arranged in a neat grid of 4 columns and 2 rows with plenty of empty space between them. Every head is the same size, seen from the same side angle facing right exactly as in the reference, cut off cleanly just below the chin with no neck, no body and no hands.

Expressions, left to right, top row first:
1. burnt out: heavy drooping eyelids, dark circles under the eyes, small frown, messy hair
2. burnt out with eyes fully closed, tired sigh, messy hair
3. neutral, calm, tidy hair
4. neutral with eyes fully closed (blinking), tidy hair
5. happy: big open smile, bright eyes, tidy hair
6. determined: focused eyebrows, confident grin, tidy hair
7. hurt: eyes squeezed shut, mouth open in an "ouch"
8. surprised: wide eyes, small round open mouth

Background: perfectly flat solid bright green (#00FF00), no texture, no shadows, no gradient. No text, no numbers, no labels.
```

### 2b. Body, hands and shoe → save as `char_body.png`

```
Using the attached character as the exact reference (same clothes, colours, ink lines and watercolour style), draw these separate parts, spread out with plenty of empty space between them, nothing touching:

1. the torso only, side view facing right, standing straight: collared shirt collar, brick-red sweater vest, brown belt, the top of the blue trousers just below the belt, and the lanyard with the gold badge hanging in front. No head, no neck, no arms, no hands, no legs.
2. a white cartoon glove, relaxed and open, hanging down: wrist cuff at the top, fingers pointing down.
3. a white cartoon glove making a fist, wrist cuff on the left, knuckles pointing right.
4. a white cartoon glove wide open with fingers spread, wrist cuff at the bottom, fingers pointing up.
5. one brown shoe, side view facing right, flat on the ground, with no leg.

Background: perfectly flat solid bright green (#00FF00), no texture, no shadows, no gradient. No text, no numbers, no labels.
```

The arms, legs and rolled-up cuffs are drawn by the game in code, using colours and texture
sampled from these images, so they bend like rubber hoses and match the painted parts.
