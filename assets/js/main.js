/* Maazaia: progressive enhancement only. The site works without this file.
   Each feature runs in its own guard so one failure cannot take down the others. */
(function () {
  'use strict';

  var root = document.documentElement;
  var isAr = root.lang === 'ar';
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.classList.add('has-js');

  var T = isAr ? {
    sending: 'جارٍ الإرسال…',
    ok: 'تم إرسال رسالتك. سنرد على البريد الإلكتروني الذي أدخلته.',
    fix: 'تحقق من الحقول المحددة.',
    challenge: 'أكمل التحقق الأمني ثم حاول مرة أخرى.',
    errors: {
      name: 'أدخل اسمك.',
      email: 'أدخل بريدًا إلكترونيًا صحيحًا.',
      subject: 'اختر موضوعًا من القائمة.',
      message: 'اكتب رسالة لا تقل عن 10 أحرف.',
      blocked: 'تم حظر الطلب. أعد تحميل الصفحة وحاول مرة أخرى.',
      challenge: 'تعذّر التحقق الأمني. أعد المحاولة.',
      rate: 'عدد الرسائل كبير حاليًا. حاول مرة أخرى لاحقًا.',
      server: 'تعذّر إرسال الرسالة. حاول مرة أخرى بعد دقائق.',
      network: 'تعذّر إرسال الرسالة. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'
    }
  } : {
    sending: 'Sending…',
    ok: 'Message sent. We will reply to the email address you gave.',
    fix: 'Check the highlighted fields.',
    challenge: 'Complete the security check and try again.',
    errors: {
      name: 'Enter your name.',
      email: 'Enter a valid email address.',
      subject: 'Choose a subject from the list.',
      message: 'Write a message of at least 10 characters.',
      blocked: 'The request was blocked. Reload the page and try again.',
      challenge: 'The security check failed. Please try again.',
      rate: 'Too many messages right now. Try again later.',
      server: 'The message could not be sent. Try again in a few minutes.',
      network: 'The message could not be sent. Check your connection and try again.'
    }
  };

  function safe(fn) {
    try { fn(); } catch (err) { if (window.console) console.error(err); }
  }

  /* ---- Theme toggle with controlled cross-fade ---- */
  safe(function () {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var switchTimer = null;
    function sync() {
      btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    }
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (!reducedMotion) {
        root.classList.add('theme-switching');
        clearTimeout(switchTimer);
        switchTimer = setTimeout(function () { root.classList.remove('theme-switching'); }, 300);
      }
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mz-theme', next); } catch (e) {}
      sync();
    });
    sync();
  });

  /* ---- Sticky header elevation + subtle reading progress hairline ---- */
  safe(function () {
    var head = document.querySelector('.site-head');
    if (!head) return;
    var ticking = false;
    function updateHeader() {
      var y = window.scrollY || window.pageYOffset || 0;
      head.classList.toggle('is-scrolled', y > 10);
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 40 ? Math.min(1, Math.max(0, y / max)) : 0;
      head.style.setProperty('--scroll-progress', ratio.toFixed(4));
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    window.addEventListener('resize', updateHeader, { passive: true });
    updateHeader();
  });

  /* ---- Mobile menu: modal behaviour via inert, focus moved in and restored ---- */
  safe(function () {
    var drawer = document.getElementById('drawer');
    var openBtn = document.querySelector('[data-burger]');
    var closeBtn = drawer && drawer.querySelector('[data-drawer-close-btn]');
    if (!drawer || !openBtn || !closeBtn) return;
    var background = [].slice.call(document.querySelectorAll('.skip, .site-head, main, .site-foot'));
    var desktop = window.matchMedia ? window.matchMedia('(min-width: 781px)') : null;

    function isOpen() { return drawer.getAttribute('data-open') === 'true'; }

    function setOpen(open, restoreFocus) {
      drawer.setAttribute('data-open', open ? 'true' : 'false');
      openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('no-scroll', open);
      background.forEach(function (el) {
        if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert');
      });
      if (open) closeBtn.focus();
      else if (restoreFocus) openBtn.focus();
    }

    openBtn.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false, true); });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) setOpen(false, true);
    });
    [].forEach.call(drawer.querySelectorAll('[data-drawer-close]'), function (a) {
      a.addEventListener('click', function () { setOpen(false, false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { e.preventDefault(); setOpen(false, true); }
    });
    if (desktop && desktop.addEventListener) {
      desktop.addEventListener('change', function (e) { if (e.matches && isOpen()) setOpen(false, false); });
    }
  });

  /* ---- Scroll-reveal observer (staggered per sibling group, works across all pages) ---- */
  safe(function () {
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    var groups = [
      '.section .head',
      '.cards .card',
      '.sectors li',
      '.process .step',
      '.contact-wrap > div',
      '.legal .toc',
      '.legal__body > h2',
      '.notfound .wrap > *'
    ];
    var seen = [];
    groups.forEach(function (selector) {
      var nodes = [].slice.call(document.querySelectorAll(selector));
      nodes.forEach(function (el, idx) {
        if (seen.indexOf(el) > -1) return;
        seen.push(el);
        el.setAttribute('data-reveal', '');
        var stagger = Math.min(idx % 6, 5) * 65;
        if (stagger > 0) el.style.setProperty('--reveal-delay', stagger + 'ms');
      });
    });
    if (!seen.length) return;

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-reveal', 'in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    seen.forEach(function (el) { revealObserver.observe(el); });

    /* Safety net: content must never stay hidden. Reveal everything for print, and if the
       page has not been scrolled at all after 5 seconds (screenshot tools, previews). */
    function revealAll() { root.classList.add('reveal-all'); }
    window.addEventListener('beforeprint', revealAll);
    var interacted = false;
    ['scroll', 'wheel', 'touchstart', 'keydown'].forEach(function (name) {
      window.addEventListener(name, function () { interacted = true; }, { passive: true, once: true });
    });
    setTimeout(function () { if (!interacted) revealAll(); }, 5000);
  });

  /* ---- Current section in the nav and on-page contents ---- */
  safe(function () {
    if (!('IntersectionObserver' in window)) return;
    var links = [].slice.call(document.querySelectorAll('.nav__link[href^="#"], .toc a[href^="#"]'));
    var targets = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) targets.push(el);
    });
    if (!targets.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  });

  /* ---- Contact form + interactive field focus/filled states ---- */
  safe(function () {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    form.noValidate = true; /* own, localised messages instead of browser bubbles */

    var status = form.querySelector('[data-form-status]');
    var button = form.querySelector('button[type="submit"]');
    var stamp = form.elements['ts'];
    var FIELDS = ['name', 'email', 'subject', 'message'];
    var siteKey = form.getAttribute('data-turnstile-sitekey') || '';
    var box = form.querySelector('[data-turnstile]');
    var widgetId = null;

    /* Field focus & filled state hooks + live clear-on-edit */
    [].forEach.call(form.querySelectorAll('.field'), function (wrapper) {
      var ctrl = wrapper.querySelector('input, select, textarea');
      if (!ctrl) return;
      function syncField() {
        wrapper.classList.toggle('is-filled', !!ctrl.value.trim());
      }
      ctrl.addEventListener('focus', function () { wrapper.classList.add('is-focused'); });
      ctrl.addEventListener('blur', function () {
        wrapper.classList.remove('is-focused');
        syncField();
      });
      ctrl.addEventListener('input', function () {
        syncField();
        if (ctrl.getAttribute('aria-invalid') === 'true' && ctrl.name) {
          setError(ctrl.name, '');
        }
      });
      ctrl.addEventListener('change', syncField);
      syncField();
    });

    function stampNow() { if (stamp) stamp.value = String(Date.now()); }
    stampNow();

    function show(text, state) {
      status.textContent = text || '';
      if (state) status.setAttribute('data-state', state); else status.removeAttribute('data-state');
    }
    function setError(field, message) {
      var control = form.elements[field];
      var out = form.querySelector('[data-error-for="' + field + '"]');
      if (out) out.textContent = message || '';
      if (control) {
        if (message) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid');
      }
    }
    function clearErrors() { FIELDS.forEach(function (f) { setError(f, ''); }); }

    function validate() {
      var first = null;
      function bad(field) { setError(field, T.errors[field]); if (!first) first = field; }
      if (!form.elements['name'].value.trim()) bad('name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements['email'].value.trim())) bad('email');
      if (!form.elements['subject'].value) bad('subject');
      if (form.elements['message'].value.trim().length < 10) bad('message');
      return first;
    }

    function resetChallenge() {
      if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
    }

    if (siteKey && box) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = function () {
        widgetId = window.turnstile.render(box, { sitekey: siteKey, language: isAr ? 'ar' : 'en' });
      };
      document.head.appendChild(s);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      show('');

      var firstBad = validate();
      if (firstBad) {
        show(T.fix, 'error');
        form.elements[firstBad].focus();
        return;
      }
      if (siteKey && widgetId === null) { show(T.challenge, 'error'); return; }

      button.disabled = true;
      show(T.sending);

      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller ? controller.signal : undefined
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            return { ok: r.ok && d.ok === true, code: d.code, field: d.field };
          });
        })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            [].forEach.call(form.querySelectorAll('.field'), function (w) { w.classList.remove('is-filled', 'is-focused'); });
            stampNow();
            show(T.ok, 'ok');
            resetChallenge();
            return;
          }
          var message = T.errors[res.code] || T.errors.server;
          if (res.field && FIELDS.indexOf(res.field) > -1) {
            setError(res.field, message);
            show(T.fix, 'error');
            form.elements[res.field].focus();
          } else {
            show(message, 'error');
          }
          resetChallenge();
        })
        .catch(function () { show(T.errors.network, 'error'); })
        .then(function () { clearTimeout(timer); button.disabled = false; });
    });
  });
})();
