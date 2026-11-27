/* Runs in <head>, before first paint, so the page never flashes the wrong theme.
   Resolves the stored choice, or the visitor's OS preference, to an explicit attribute. */
(function () {
  var theme = null;
  try {
    var saved = localStorage.getItem('mz-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
  } catch (e) {}
  if (!theme) {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
