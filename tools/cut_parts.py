"""Cut character parts out of a Nano Banana sheet painted on a flat green background.

Usage:
  python3 tools/cut_parts.py game/images/char_heads.png heads tired tired_blink neutral neutral_blink happy determined hurt surprised
  python3 tools/cut_parts.py game/images/char_body.png body torso glove_relaxed glove_fist glove_open shoe

Writes transparent PNGs to game/images/parts/<prefix>_<name>.png in reading order
(top row left to right, then the next row), plus a numbered preview sheet to check.
"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image, ImageDraw

def key_green(rgb):
    r, g, b = [rgb[..., i].astype(np.float32) for i in range(3)]
    other = np.maximum(r, b)
    greenness = g - other                      # >0 where the pixel leans green
    # fully background above 90, fully foreground below 35, soft in between
    alpha = np.clip((90 - greenness) / 55, 0, 1)
    # despill: pull leftover green on soft edges down to the other channels
    g2 = np.where(greenness > -10, np.minimum(g, other), g)  # remove green fringe on outlines
    out = np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)
    return out, alpha > 0.5

def components(mask, step=4, min_frac=0.002):
    small = mask[::step, ::step]
    h, w = small.shape
    seen = np.zeros_like(small, bool)
    boxes = []
    for y in range(h):
        for x in range(w):
            if small[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True
                y0 = y1 = y; x0 = x1 = x; n = 0
                while q:
                    cy, cx = q.popleft(); n += 1
                    y0, y1, x0, x1 = min(y0, cy), max(y1, cy), min(x0, cx), max(x1, cx)
                    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1), (cy+1, cx+1), (cy-1, cx-1), (cy+1, cx-1), (cy-1, cx+1)):
                        if 0 <= ny < h and 0 <= nx < w and small[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if n >= 4:  # ignore single-pixel specks
                    boxes.append(([x0*step, y0*step, (x1+1)*step, (y1+1)*step], n >= min_frac * h * w))
    big = [b for b, is_big in boxes if is_big]
    # small loose bits (a hair curl, a badge) join the nearest big part if close, else are dropped
    for b, is_big in boxes:
        if is_big: continue
        def dist(a):
            dx = max(a[0] - b[2], b[0] - a[2], 0); dy = max(a[1] - b[3], b[1] - a[3], 0)
            return (dx*dx + dy*dy) ** 0.5
        near = min(big, key=dist, default=None)
        if near is not None and dist(near) < 40:
            near[0], near[1] = min(near[0], b[0]), min(near[1], b[1])
            near[2], near[3] = max(near[2], b[2]), max(near[3], b[3])
    return big

def merge_close(boxes, gap=2):
    # join small loose bits (a hair curl, a badge) to the part they belong to
    changed = True
    while changed:
        changed = False
        for i in range(len(boxes)):
            for j in range(i+1, len(boxes)):
                a, b = boxes[i], boxes[j]
                if a[0]-gap < b[2] and b[0]-gap < a[2] and a[1]-gap < b[3] and b[1]-gap < a[3]:
                    boxes[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]
                    boxes.pop(j); changed = True; break
            if changed: break
    return boxes

def reading_order(boxes):
    # boxes that overlap vertically belong to the same row, even if their heights differ a lot
    boxes = sorted(boxes, key=lambda b: b[1])
    rows = []
    for b in boxes:
        if rows and b[1] < rows[-1][0]:            # starts above the bottom of the current row
            rows[-1][0] = max(rows[-1][0], b[3]); rows[-1][1].append(b)
        else:
            rows.append([b[3], [b]])
    return [b for _, r in rows for b in sorted(r, key=lambda b: b[0])]

def main():
    src, prefix, names = sys.argv[1], sys.argv[2], sys.argv[3:]
    img = np.array(Image.open(src).convert('RGB'))
    rgba, mask = key_green(img)
    boxes = reading_order(merge_close(components(mask)))
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    outdir = os.path.join(root, 'game', 'images', 'parts'); os.makedirs(outdir, exist_ok=True)
    print(f'found {len(boxes)} parts, expected {len(names)}')
    preview = Image.fromarray(img).convert('RGB'); d = ImageDraw.Draw(preview)
    H, W = mask.shape
    for i, b in enumerate(boxes):
        x0, y0, x1, y1 = max(0, b[0]-6), max(0, b[1]-6), min(W, b[2]+6), min(H, b[3]+6)
        name = names[i] if i < len(names) else f'extra{i+1}'
        Image.fromarray(rgba[y0:y1, x0:x1]).save(os.path.join(outdir, f'{prefix}_{name}.png'))
        d.rectangle([x0, y0, x1, y1], outline=(255, 0, 0), width=4)
        d.text((x0+8, y0+8), f'{i+1} {name}', fill=(255, 0, 0))
        print(f'  {i+1}. {prefix}_{name}.png  {x1-x0}x{y1-y0}')
    preview.save(os.path.join(outdir, f'_preview_{prefix}.png'))

if __name__ == '__main__':
    main()
