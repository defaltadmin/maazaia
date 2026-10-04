/* Maazaia — progressive enhancement only.
   Every feature here degrades gracefully: the page is fully readable
   and navigable if this file fails to load. */
(() => {
  'use strict';

  /* ---------- theme toggle ----------
     The initial value is set by a tiny inline script in <head> so the
     page never flashes the wrong theme. This only handles the toggle. */
  const root = document.documentElement;
  const THEME_KEY = 'mz-theme';

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const resolveTheme = () => {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch { /* storage blocked */ }
    if (stored === 'dark' || stored === 'light') return stored;
    return prefersDark.matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    });
  };

  applyTheme(resolveTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    });
  });

  // Follow the OS if the visitor has not made an explicit choice
  prefersDark.addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
    if (!stored) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ---------- mobile nav drawer ---------- */
  const drawer = document.getElementById('drawer');
  if (drawer) {
    const setOpen = (open) => {
      drawer.dataset.open = String(open);
      document.body.style.overflow = open ? 'hidden' : '';
      document.querySelectorAll('[data-burger]').forEach((b) =>
        b.setAttribute('aria-expanded', String(open))
      );
      if (open) {
        const first = drawer.querySelector('a, button');
        if (first) first.focus({ preventScroll: true });
      }
    };
    const burger = document.querySelector('[data-burger]');
    if (burger) {
      burger.addEventListener('click', () => setOpen(drawer.dataset.open !== 'true'));
    }
    document.querySelectorAll('[data-drawer-close]').forEach((el) =>
      el.addEventListener('click', () => setOpen(false))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.dataset.open === 'true') {
        setOpen(false);
        if (burger) burger.focus();
      }
    });
    // Any anchor inside the drawer that points to a section closes it
    drawer.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) setOpen(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  const revealables = document.querySelectorAll('.rv');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealables.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.setAttribute('data-in', 'true'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Number(el.dataset.delay || 0);
            setTimeout(() => el.setAttribute('data-in', 'true'), delay);
            io.unobserve(el);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  /* ---------- header shadow on scroll ---------- */
  const head = document.querySelector('.site-head');
  if (head && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(
      ([entry]) => head.classList.toggle('is-stuck', !entry.isIntersecting),
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* ---------- cookie notice ----------
     The site sets no tracking cookies today, so this is an informational
     notice rather than a consent gate. The choices it records are still
     stored, so adding analytics later needs no rework. */
  const notice = document.querySelector('[data-cookie-notice]');
  if (notice) {
    const KEY = 'mz-cookie-choice';
    let stored = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* private mode / storage blocked — notice stays dismissible per session */
    }

    const close = () => {
      notice.dataset.show = 'false';
    };

    if (stored) {
      // already decided: do not show again
      notice.remove();
    } else {
      notice.dataset.show = 'true';
      notice.querySelectorAll('[data-cookie-choice]').forEach((btn) => {
        btn.addEventListener('click', () => {
          try {
            localStorage.setItem(KEY, btn.dataset.cookieChoice || 'essential');
          } catch {
            /* ignore */
          }
          close();
        });
      });
    }
  }
})();
