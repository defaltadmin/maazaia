(() => {
  const drawer = document.querySelector('[data-burger]') && document.getElementById('drawer');
  if (!drawer) return;
  const setOpen = (open) => {
    drawer.dataset.open = String(open);
    document.querySelectorAll('[data-burger]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  document.querySelectorAll('[data-burger]').forEach((button) => button.addEventListener('click', () => setOpen(drawer.dataset.open !== 'true')));
  document.querySelectorAll('[data-drawer-close]').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
})();
