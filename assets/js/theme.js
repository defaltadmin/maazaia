/* Applies the stored theme before first paint.
   This file is loaded synchronously in <head>, so it is deliberately
   tiny (well under 1 KB) — a large synchronous script would block the
   first paint. Everything else lives in main.js, which is deferred.

   Kept as a separate file rather than inline because the Content
   Security Policy does not permit 'unsafe-inline' for scripts. */
(() => {
  try {
    const stored = localStorage.getItem('mz-theme');
    const theme = (stored === 'dark' || stored === 'light')
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    /* storage blocked — the light theme already in the CSS applies */
  }
})();