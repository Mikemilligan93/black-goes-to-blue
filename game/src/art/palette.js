// ============================================================
//  PALETTE + COLOUR RETURN
//  Every colour belongs to a "group". Each defeated boss restores one
//  group (0 = grey, 1 = full colour). Colours with group null never
//  change (ink, white shirt, paper).
// ============================================================
window.Art = window.Art || {};

Art.GROUPS = {
  red:    { name: 'Courage red',    hex: '#C8423B' },
  gold:   { name: 'Sunny gold',     hex: '#E3A72F' },
  green:  { name: 'Growth green',   hex: '#6BA644' },
  teal:   { name: 'Calm teal',      hex: '#2F8F87' },
  blue:   { name: 'Clear-sky blue', hex: '#4C8FC9' },
  peach:  { name: 'Warmth',         hex: '#E8A27E' },
};

// name: [hex, group]
Art.PAL = {
  ink:        ['#1B1A17', null],
  paper:      ['#EFE8D8', null],
  white:      ['#F6F3EA', null],
  skin:       ['#F0C09A', 'peach'],
  skinShade:  ['#D99C78', 'peach'],
  hair:       ['#5A3A26', 'peach'],
  tie:        ['#C8423B', 'red'],
  trousers:   ['#34466E', 'blue'],
  wall:       ['#6FA39A', 'teal'],
  wallStripe: ['#5E9088', 'teal'],
  floor:      ['#B07A3E', 'gold'],
  floorLine:  ['#8E5F2E', 'gold'],
  lamp:       ['#E9B53A', 'gold'],
  plant:      ['#6BA644', 'green'],
  plantDark:  ['#4F8433', 'green'],
  pot:        ['#C8623B', 'red'],
  sky:        ['#8DB8DE', 'blue'],
};

// How much colour each group has (0..1). The game changes these.
Art.levels = { red: 0, gold: 0, green: 0, teal: 0, blue: 0, peach: 0 };

Art._rgb = function (hex) {
  var n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Warm film grey of a colour (slight sepia so it looks like old film, not flat grey).
Art._grey = function (rgb) {
  var y = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
  return [Math.min(255, y * 1.03), y, y * 0.92];
};

// Colour of a palette entry right now, with its group's colour level applied.
Art.c = function (name, extraLevel) {
  var e = Art.PAL[name];
  var rgb = Art._rgb(e[0]);
  if (!e[1]) return e[0];
  var k = Art.levels[e[1]];
  if (extraLevel !== undefined) k = Math.max(k, extraLevel);
  var g = Art._grey(rgb);
  return 'rgb(' + Math.round(g[0] + (rgb[0] - g[0]) * k) + ',' +
                  Math.round(g[1] + (rgb[1] - g[1]) * k) + ',' +
                  Math.round(g[2] + (rgb[2] - g[2]) * k) + ')';
};
