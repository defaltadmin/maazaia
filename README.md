# maazaia.com

Bilingual (English / Arabic) static website for **Maazaia**, a manpower outsourcing and
recruitment company in the Kingdom of Saudi Arabia.

Plain HTML, CSS and JavaScript. **No build step, no framework, no npm install required.**
Push to GitHub, connect to Cloudflare Pages, done. Form handling runs on Cloudflare Pages
Functions (`/functions`), so there is no traditional backend to host.

> **Read `ASSUMPTIONS.md` before launch.** Branding, licence numbers, statistics, address and
> phone numbers are all placeholders. Every one of them is listed there with its file location.

---

## 1. Repository structure

```
/
├── index.html              English home
├── about.html              About us / licensing & credibility
├── services.html           Services detail
├── industries.html         Industries served
├── employers.html          Request staff form  -> POST /api/contact
├── jobseekers.html         CV submission form  -> POST /api/apply
├── contact.html            Address, phone, email, click-to-load map, message form
├── privacy.html            PDPL privacy policy (complete text)
├── terms.html              Terms of use
├── 404.html                Not-found page (served automatically by Pages)
│
├── ar/                     Arabic mirror of all nine pages, dir="rtl"
│   ├── index.html … terms.html
│
├── assets/
│   ├── css/styles.css      Whole design system, tokens at the top
│   ├── css/rtl.css         RTL-only overrides, loaded on /ar/ pages
│   ├── js/main.js          Nav drawer, scroll reveal, ToC highlight, click-to-load map
│   ├── js/forms.js         Validation, Turnstile check, fetch submit, states
│   └── img/                Placeholder logo, favicon, Apple icon, OG image
│
├── functions/api/
│   ├── _shared.js          Turnstile verification, payload parsing, mail sending
│   ├── contact.js          POST /api/contact  (employer + general enquiries)
│   └── apply.js            POST /api/apply    (applications, CV attachment)
│
├── _headers                Security headers + cache policy (Cloudflare Pages)
├── _redirects              Legacy path redirects
├── robots.txt
├── sitemap.xml             18 URLs with hreflang alternates
├── .env.example            Names of the environment variables you must set
├── .gitignore
├── ASSUMPTIONS.md          Everything invented that you need to confirm or replace
└── README.md
```

URLs are extensionless in production: Cloudflare Pages serves `about.html` at `/about`
and redirects `/about.html` to `/about`. All internal links already use the clean form.

---

## 2. Run it locally

**Option A, static only** (everything except form submission):

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

**Option B, with working forms** (runs the Pages Functions too):

```bash
npx wrangler pages dev .
```

Create a `.dev.vars` file first (copy `.env.example`). The Turnstile site key shipped in the
HTML is Cloudflare's **test key**, which always passes, so forms work locally out of the box.

---

## 3. Editing content

There is no templating layer on purpose: open the HTML and edit the text.

- **English copy** lives in the root `*.html` files, **Arabic copy** in `ar/*.html`.
- The two locales are structurally identical. When you add a section to one, mirror it in the
  other, and keep the `<link rel="alternate" hreflang="…">` tags in `<head>` in sync.
- Arabic pages carry `dir="rtl"` on `<html>` and load `rtl.css`. The layout uses CSS logical
  properties (`padding-inline`, `margin-inline-start`), so most changes mirror automatically.
  Wrap Latin fragments (emails, phone numbers) in `<span class="ltr">` inside Arabic text.
- Add a new page: create `page.html` and `ar/page.html`, add both to `sitemap.xml`, and add the
  nav entry to the header **and** the mobile drawer in every page (the nav is duplicated per
  file, which is the cost of having no build step; 20 files, find-and-replace works fine).

---

## 4. Branding (all placeholder)

Everything visual is driven by tokens in the `:root` block at the top of
`assets/css/styles.css`. To rebrand, change these and nothing else:

| Token | Current placeholder | Role |
|---|---|---|
| `--brand` | `oklch(46% 0.095 172)` deep teal-green | buttons, links, accents |
| `--brand-deep` | `oklch(31% 0.068 174)` | hover states, dark panels |
| `--brand-darker` | `oklch(23.5% 0.05 174)` | reserved for deeper surfaces |
| `--brand-soft` | `oklch(93% 0.028 172)` | tinted backgrounds |
| `--accent` | `oklch(72% 0.14 68)` desert ochre | primary CTA, numbers, eyebrows on dark |
| `--accent-deep` | `oklch(55% 0.13 62)` | accent text on light backgrounds |
| `--sans` | IBM Plex Sans Arabic | all UI text, both scripts |
| `--serif` | Newsreader italic | editorial numerals and pull quotes (Latin only) |

Colours are OKLCH. Every neutral is already tinted toward the brand hue, so changing `--brand`
alone shifts the whole page coherently. Fonts load from Google Fonts in each `<head>`.

The logo is a placeholder wordmark plus an inline SVG mark. Replace:

1. `assets/img/logo-placeholder.svg`, `assets/img/favicon.svg`, `assets/img/apple-touch-icon.png`
2. `assets/img/og-image.png` (1200x630, used for social sharing)
3. The inline `<svg class="brand__mark">` in the header and footer of all 20 HTML files
4. `<meta name="theme-color" content="#1c3b35">` in each `<head>`

---

## 5. Forms

Both forms work the same way:

1. The browser validates fields, then checks that Cloudflare Turnstile produced a token.
2. `fetch` POSTs to a Pages Function. JSON normally, `multipart/form-data` when a CV is attached.
3. The Function **re-verifies the Turnstile token server-side** (mandatory: the client check
   alone is worthless), validates the fields again, then emails the submission.
4. Success and error states render inline. Without JavaScript the form still posts natively
   to the same endpoint.

### 5.1 Turnstile

1. Cloudflare dashboard → **Turnstile** → **Add widget**. Domain: `maazaia.com`
   (add `localhost` too for local testing). Widget mode: **Managed**.
2. Copy the **site key** into the six `data-sitekey="…"` attributes:
   `employers.html`, `jobseekers.html`, `contact.html` and their `ar/` counterparts.
   They currently hold the test key `1x00000000000000000000AA`, which always passes.
3. Put the **secret key** in the `TURNSTILE_SECRET_KEY` environment variable (step 5.2).

### 5.2 Environment variables

Cloudflare Pages → your project → **Settings → Environment variables** (set them for both
Production and Preview):

| Variable | Required | Purpose |
|---|---|---|
| `TURNSTILE_SECRET_KEY` | yes | server-side CAPTCHA verification |
| `RESEND_API_KEY` | yes (for email) | API key from [resend.com](https://resend.com) |
| `MAIL_FROM` | yes | e.g. `Maazaia Website <website@maazaia.com>`, domain must be verified in Resend |
| `MAIL_TO_SALES` | yes | where employer enquiries land |
| `MAIL_TO_CAREERS` | yes | where CV applications land |
| `FORWARD_WEBHOOK_URL` | optional | also POST the JSON payload here (Zapier, Make, a CRM, an ATS) |

Email uses Resend because MailChannels' free Cloudflare integration was withdrawn in 2024.
To switch provider, replace the single `sendMail()` function in `functions/api/_shared.js`
(SendGrid, Postmark, Mailgun and Brevo are all one `fetch` call). If you would rather skip
email entirely, set only `FORWARD_WEBHOOK_URL` and the Functions will forward submissions
there instead.

CV uploads are limited to PDF / DOC / DOCX at 5 MB, enforced both client and server side,
and attached to the notification email. Nothing is stored at rest by default. If you want
CVs archived, add an [R2 bucket](https://developers.cloudflare.com/r2/) binding and write the
file in `functions/api/apply.js` before sending the mail, and update the retention table in
`privacy.html` and `ar/privacy.html` to match.

---

## 6. Deployment

### 6.1 Create the GitHub repository

```bash
cd maazaia-site
git init
git add .
git commit -m "Initial Maazaia website"
git branch -M main
git remote add origin https://github.com/<your-org>/maazaia-site.git
git push -u origin main
```

### 6.2 Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → authorise GitHub → pick `maazaia-site`.
2. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *leave empty*
   - **Build output directory:** `/`
   - **Root directory:** `/`
3. **Save and Deploy.** First build takes under a minute. You get
   `maazaia-site.pages.dev`, plus a preview URL for every future branch and pull request.
4. Add the environment variables from step 5.2, then **Retry deployment** so the Functions
   pick them up.

Every push to `main` redeploys automatically. Pages Functions in `/functions` are detected
and deployed with no extra configuration.

### 6.3 Point maazaia.com at it

1. Add `maazaia.com` as a zone in Cloudflare (**Add a site**) and move the nameservers at
   your registrar to the two Cloudflare nameservers shown. Wait for the zone to go **Active**.
2. Pages project → **Custom domains** → **Set up a domain** → enter `maazaia.com` →
   **Activate domain**. Repeat for `www.maazaia.com`.
3. Cloudflare creates the DNS records for you when the zone is in the same account:
   `maazaia.com` → CNAME → `maazaia-site.pages.dev` (flattened at the apex, proxied)
   `www` → CNAME → `maazaia-site.pages.dev` (proxied)
   If the domain lives in another account, create those CNAMEs manually.
4. SSL/TLS → **Overview** → encryption mode **Full (strict)**. Edge certificates →
   enable **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
5. Decide on a canonical host. The site's canonical tags and `sitemap.xml` use the apex
   (`https://maazaia.com`), so add a Cloudflare **Redirect Rule**: hostname equals
   `www.maazaia.com` → 301 → `https://maazaia.com/${1}` preserving path and query.

### 6.4 Post-launch checklist

- [ ] Real Turnstile site key in all six form pages, secret key set as a variable
- [ ] Submit each form once in production and confirm the email arrives
- [ ] Replace every `[BRACKETED]` placeholder (see `ASSUMPTIONS.md`)
- [ ] Verify the address, phone, WhatsApp number and map coordinates in `contact.html`
- [ ] Legal review of `privacy.html` and `terms.html` by Saudi counsel
- [ ] Submit `https://maazaia.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools
- [ ] Check the hreflang pairs with Search Console's international targeting report
- [ ] Google Business Profile for the Riyadh office, matching the address on the site
- [ ] Update `sitemap.xml` `<lastmod>` dates when content changes materially

---

## 7. SEO

Already in place: unique `<title>` and meta description per page and per locale, canonical
URLs, reciprocal `hreflang` (`en`, `ar`, `x-default`) in both the HTML head and the sitemap,
Open Graph and Twitter cards with a 1200x630 image, `EmploymentAgency` JSON-LD with address,
geo coordinates and opening hours, `FAQPage` JSON-LD on both homepages, `robots.txt`
disallowing `/api/`, and a sitemap covering all 18 indexable URLs.

Not included by choice: analytics. No tracking script is loaded, so no cookie banner is
needed. If you add analytics, add a consent mechanism first and update the cookies section of
the privacy policy (both locales).

---

## 8. Compliance notes

- **PDPL.** `privacy.html` is a complete policy, not a stub: controller identity, lawful bases
  per purpose, sensitive-data handling, disclosure recipients including Qiwa / Muqeem / GOSI /
  WPS, cross-border transfer conditions, a retention table, security measures, 72-hour breach
  notification, the five data-subject rights with a 30-day response commitment, and the SDAIA
  complaint route. Fill in the bracketed company identifiers and have Saudi counsel review it.
- **Privacy by design.** Google Maps is click-to-load, so no third-party request fires until a
  visitor asks for the map. No advertising cookies, no analytics, no cross-site trackers.
- **Candidate fee ban.** Saudi regulation prohibits charging jobseekers recruitment fees. The
  site states this on the jobseekers page, in the FAQ and in the terms. Keep it there.
- **Security headers.** `_headers` sets HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` and a Content Security Policy that allows only Cloudflare Turnstile,
  Google Fonts and the Google Maps frame. If you add a third-party script, add it to the CSP
  or it will be blocked.

## 9. Accessibility

Semantic landmarks, a skip link, visible `:focus-visible` rings, 44px minimum touch targets,
labelled form controls with `aria-invalid` and inline error messages, `aria-live` status
regions for submit feedback, keyboard-operable file upload and nav drawer, and full
`prefers-reduced-motion` support. Colour pairings target WCAG AA contrast. Re-check contrast
after you swap the palette.
