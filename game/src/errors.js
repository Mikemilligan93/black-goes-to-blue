// Shows a readable message on screen if any file has a mistake (e.g. a missing quote in texts.js).
window.addEventListener('error', function (e) {
  var box = document.getElementById('error');
  if (!box || box.style.display === 'block') return; // keep the first, most useful message
  var file = (e.filename || '').split('/').pop() || 'unknown file';
  box.style.display = 'block';
  box.textContent =
    'Something is wrong in ' + file + (e.lineno ? ' around line ' + e.lineno : '') + '.\n\n' +
    (e.message || '') + '\n\n' +
    'Tip: if you just edited a text file, check that every line looks like\n' +
    '  KEY: "your text",\n' +
    'with both quote marks and the comma at the end.';
});

// When the game is opened by double-clicking index.html, the browser hides which file failed.
// So we also check that every content file actually loaded, and name the one that did not.
window.checkDataFiles = function () {
  var files = [['TEXT', 'texts.js'], ['QUOTES', 'quotes.js'], ['CONFIG', 'config.js'], ['BOSSES', 'bosses.js']];
  for (var i = 0; i < files.length; i++) {
    if (typeof window[files[i][0]] === 'undefined') {
      var box = document.getElementById('error');
      box.style.display = 'block';
      box.textContent =
        'The file ' + files[i][1] + ' has a mistake, so the game cannot start.\n\n' +
        'Check the lines you edited last. Every line should look like\n' +
        '  KEY: "your text",\n' +
        'with both quote marks and the comma at the end.\n' +
        'A quote mark inside a text must be written as \\"';
      return false;
    }
  }
  return true;
};
