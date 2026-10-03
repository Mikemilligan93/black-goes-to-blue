// Keyboard input. Actions map to several keys so arrows and WASD both work.
window.Input = (function () {
  var down = {}, pressed = {};
  var MAP = {
    left: ['arrowleft', 'a'], right: ['arrowright', 'd'],
    jump: [' ', 'w', 'arrowup'], throw: ['x', 'j'], ability: ['shift', 'k'],
    pause: ['escape', 'p'], mute: ['m'], start: [' ', 'enter'],
  };
  var BLOCK = [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
  window.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (!down[k]) pressed[k] = true;
    down[k] = true;
    if (BLOCK.indexOf(k) >= 0) e.preventDefault();
  });
  window.addEventListener('keyup', function (e) { down[e.key.toLowerCase()] = false; });
  window.addEventListener('blur', function () { down = {}; });
  return {
    held: function (a) { return MAP[a].some(function (k) { return down[k]; }); },
    hit: function (a) { return MAP[a].some(function (k) { return pressed[k]; }); },
    key: function (k) { return !!pressed[k]; },           // a single raw key, pressed this step
    endStep: function () { pressed = {}; },
  };
})();
