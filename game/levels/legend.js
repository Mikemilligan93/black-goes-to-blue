// ============================================================
//  LEVEL MAP LEGEND - what each letter in a level map means.
//  A map is a grid: one letter = one tile (40 x 40 pixels).
//  Big objects (desk, cabinet...) are placed with ONE letter at their
//  bottom-left corner; leave the rest of their space as dots.
//  w / h = size in tiles (h sets the height; painted art keeps its own width).
// ============================================================
window.LEGEND = {
  '.': { type: 'empty' },
  '#': { type: 'ground' },                     // floor; gaps in the floor are pits
  '=': { type: 'plank' },                      // thin wall shelf: jump up through it, stand on top
  'D': { type: 'prop', art: 'props_desk',    w: 4,   h: 2,   solid: 'oneway' },
  'F': { type: 'prop', art: 'props_cabinet', w: 2,   h: 3.5, solid: 'solid' },
  'S': { type: 'prop', art: 'props_shelf',   w: 3,   h: 2.5, solid: 'solid' },
  'B': { type: 'prop', art: 'props_boxes',   w: 2,   h: 2,   solid: 'solid' },
  'c': { type: 'hazard', art: 'props_coffee', w: 2,  h: 0.6, damage: 'coffee' },
  'p': { type: 'hazard', art: 'props_papers', w: 2,  h: 1.2, damage: 'papers' },
  'C': { type: 'checkpoint', art: 'props_cooler', w: 1.5, h: 3 },
  'E': { type: 'enemy', kind: 'envelope' },
  'P': { type: 'start' },
  'X': { type: 'exit', w: 2, h: 4 },
};
