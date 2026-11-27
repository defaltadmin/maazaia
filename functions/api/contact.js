// Cloudflare Pages Function: POST /api/contact
//
// Variables (Pages project > Settings > Variables and Secrets):
//   RESEND_API_KEY    secret    API key from resend.com (maazaia.com must be a verified domain there)
//   CONTACT_TO        plain     inbox that receives the messages
//   CONTACT_FROM      plain     sender, e.g. Maazaia Website <website@maazaia.com>
// Optional extra protection (each switches on when present):
//   TURNSTILE_SECRET  secret    Cloudflare Turnstile secret key (also set data-turnstile-sitekey on the forms)
//   RATE_LIMIT        KV bind   a KV namespace; limits each IP to 5 messages per hour
//
// The destination address lives only in CONTACT_TO and never appears in the page source.

const SUBJECTS = [
  'Manpower request',
  'Permanent recruitment brief',
  'Visa, iqama or payroll support',
  'Other enquiry',
];

const MAX_BODY_BYTES = 20000;
const MIN_FILL_MS = 1500; // a person cannot read and fill this form faster than this
const RATE_LIMIT_PER_HOUR = 5;

const COPY = {
  en: {
    sentTitle: 'Message sent',
    sent: 'We will reply to the email address you gave.',
    failTitle: 'Message not sent',
    fail: 'The message could not be sent. Please go back and try again.',
    back: 'Back to maazaia.com',
  },
  ar: {
    sentTitle: 'تم إرسال الرسالة',
    sent: 'سنرد على البريد الإلكتروني الذي أدخلته.',
    failTitle: 'تعذّر إرسال الرسالة',
    fail: 'تعذّر إرسال الرسالة. ارجع إلى الصفحة وحاول مرة أخرى.',
    back: 'العودة إلى maazaia.com',
  },
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const page = (lang, ok, status) => {
  const c = COPY[lang] || COPY.en;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const title = escapeHtml(ok ? c.sentTitle : c.failTitle);
  const text = escapeHtml(ok ? c.sent : c.fail);
  return new Response(
    `<!doctype html><html lang="${lang}" dir="${dir}"><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">` +
      `<title>${title}</title><link rel="stylesheet" href="/assets/css/styles.css">` +
      `<body><main class="wrap notfound"><h1>${title}</h1><p class="lead">${text}</p>` +
      `<p><a class="btn" href="${lang === 'ar' ? '/ar/' : '/'}#contact">${escapeHtml(c.back)}</a></p></main></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }
  );
};

// Only real strings count. A File or anything else is treated as empty.
const str = (v) => (typeof v === 'string' ? v : '');

// One line, no control characters, so a field can never inject mail headers.
const oneLine = (v, max) => str(v).replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').trim().slice(0, max);

const multiLine = (v, max) =>
  str(v)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);

const hostOf = (value) => {
  try {
    return value ? new URL(value).host : null;
  } catch (_) {
    return null;
  }
};

async function overRateLimit(env, ip) {
  if (!env.RATE_LIMIT || !ip) return false;
  const key = `rl:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const used = parseInt((await env.RATE_LIMIT.get(key)) || '0', 10);
  if (used >= RATE_LIMIT_PER_HOUR) return true;
  await env.RATE_LIMIT.put(key, String(used + 1), { expirationTtl: 7200 });
  return false;
}

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true; // not switched on
  if (!token) return false;
  try {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await res.json();
    return data.success === true;
  } catch (_) {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  let lang = 'en';

  // ok: boolean. code: machine-readable reason the page maps to a localised message.
  const respond = (ok, status, code, field) =>
    wantsJson ? json(ok ? { ok: true } : { ok: false, code, field }, status) : page(lang, ok, status);

  // 1. Size guard before anything is parsed.
  const declared = parseInt(request.headers.get('content-length') || '0', 10);
  if (declared > MAX_BODY_BYTES) return respond(false, 413, 'blocked');

  // 2. Same-site only. Fails closed: a request that proves nothing about where it came from is refused.
  const self = new URL(request.url).host;
  const originHost = hostOf(request.headers.get('origin'));
  const refererHost = hostOf(request.headers.get('referer'));
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') return respond(false, 403, 'blocked');
  if (originHost && originHost !== self) return respond(false, 403, 'blocked');
  if (refererHost && refererHost !== self) return respond(false, 403, 'blocked');
  if (!originHost && !refererHost && !fetchSite) return respond(false, 403, 'blocked');

  // 3. Parse.
  let form;
  try {
    form = await request.formData();
  } catch (_) {
    return respond(false, 400, 'blocked');
  }
  let count = 0;
  for (const _ of form.keys()) if (++count > 20) return respond(false, 400, 'blocked');

  lang = str(form.get('lang')) === 'ar' ? 'ar' : 'en';

  // 4. Honeypot. The field has a name no browser autofills; bots tend to fill every input.
  //    Pretend it worked so the bot does not adapt.
  if (str(form.get('ref_code')).trim() !== '') {
    console.warn('contact form: honeypot filled');
    return respond(true, 200);
  }

  // 5. Too fast to be a person (the page stamps the time when it loads).
  const stamped = Number(str(form.get('ts')));
  if (stamped && Date.now() - stamped < MIN_FILL_MS) return respond(false, 429, 'blocked');

  // 6. Validate.
  const name = oneLine(form.get('name'), 100).replace(/[^\p{L}\p{M}\p{N}\s.'’-]/gu, '').trim();
  const email = oneLine(form.get('email'), 254);
  const subject = oneLine(form.get('subject'), 100);
  const message = multiLine(form.get('message'), 3000);

  if (!name) return respond(false, 400, 'name', 'name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond(false, 400, 'email', 'email');
  if (!SUBJECTS.includes(subject)) return respond(false, 400, 'subject', 'subject');
  if (message.length < 10) return respond(false, 400, 'message', 'message');

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    console.error('contact form: RESEND_API_KEY, CONTACT_TO or CONTACT_FROM is not set');
    return respond(false, 500, 'server');
  }

  // 7. Optional layers: Turnstile, then per-IP rate limit.
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!(await turnstileOk(env, str(form.get('cf-turnstile-response')), ip))) return respond(false, 400, 'challenge');
  if (await overRateLimit(env, ip)) return respond(false, 429, 'rate');

  // 8. Send.
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    `Page language: ${lang === 'ar' ? 'Arabic' : 'English'}`,
    '',
    message,
    '',
    '---',
    'Sent from the maazaia.com contact form. Reply to this email to answer the sender.',
  ].join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let res;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `[Website] ${subject} - ${name}`,
        text,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    console.error('contact form: email provider request failed', err);
    return respond(false, 502, 'server');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    console.error('contact form: email provider error', res.status, await res.text());
    return respond(false, 502, 'server');
  }

  return respond(true, 200);
}

// Any other method on /api/contact.
export const onRequest = () =>
  new Response('Method not allowed', { status: 405, headers: { Allow: 'POST', 'cache-control': 'no-store' } });
