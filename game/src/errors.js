// Shows a readable message on screen if any file has a mistake (e.g. a missing quote in texts.js).
window.addEventListener('error', function (e) {
  var box = document.getElementById('error');
  if (!box) return;
  var file = (e.filename || '').split('/').pop() || 'unknown file';
  box.style.display = 'block';
  box.textContent =
    'Something is wrong in ' + file + (e.lineno ? ' around line ' + e.lineno : '') + '.\n\n' +
    (e.message || '') + '\n\n' +
    'Tip: if you just edited a text file, check that every line looks like\n' +
    '  KEY: "your text",\n' +
    'with both quote marks and the comma at the end.';
});
