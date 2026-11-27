/* Maazaia: progressive enhancement only. The site works without this file.
   Each feature runs in its own guard so one failure cannot take down the others. */
(function () {
  'use strict';

  var root = document.documentElement;
  var isAr = root.lang === 'ar';
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

  /* ---- Theme toggle ---- */
  safe(function () {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    function sync() {
      btn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    }
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mz-theme', next); } catch (e) {}
      sync();
    });
    sync();
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

  /* ---- Contact form ---- */
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
