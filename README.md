# Maazaia website

Static site for Cloudflare Pages: plain HTML, CSS and JavaScript, plus one Pages Function. No build step, no dependencies, no analytics, no third-party requests (fonts are self-hosted).

## Structure
```
/
                      index.html (EN), ar/index.html (AR), 404.html
                      privacy.html, terms.html and ar/privacy.html, ar/terms.html
robots.txt, sitemap.xml, favicon.ico, _redirects (old /cookies URLs now point to the privacy pages)
_headers               security headers, CSP, caching (Cloudflare Pages reads this file)
assets/                css, js, fonts (IBM Plex Sans Arabic, Plus Jakarta Sans), img
functions/api/contact.js   POST /api/contact
```
Deploy by pushing to the Pages repo. Keep `functions/` at the repo root.

## Contact form: required setup

1. Resend: create an account, verify the domain `maazaia.com` (add the DNS records it shows), create an API key.
2. Pages project, Settings, Variables and Secrets:
   - `RESEND_API_KEY` (secret)
   - `CONTACT_TO` = the client inbox
   - `CONTACT_FROM` = `Maazaia Website <the client inbox>`
3. Send a test message from the live form. Reply-to is the visitor's address, so "Reply" answers them.

Mail deliverability: make sure `maazaia.com` has SPF, DKIM (from Resend) and a DMARC record. Without them messages can land in spam.

## Spam and abuse protection (in order of effort)

- Already on: same-site check (fails closed), hidden honeypot field, minimum fill time, size and field-count limits.
- Cloudflare dashboard, Security, WAF, Rate limiting rules: add a rule for path `/api/contact`, method POST, 5 requests per 10 minutes per IP, action Block. Free plan includes one rule.
- Turnstile (recommended if spam appears): create a Turnstile widget in Cloudflare, put the site key in `data-turnstile-sitekey=""` on the form in both `index.html` and `ar/index.html`, and add the secret as `TURNSTILE_SECRET`. The privacy page already mentions a security check by Cloudflare.
- Optional per-IP limit in code: bind a KV namespace named `RATE_LIMIT` to the Pages project. The function then allows 5 messages per IP per hour.

## Before launch (needs the client)

- Legal pages were rewritten to say only what the site actually does. Have a Saudi lawyer review them, and add the company's legal name, commercial registration number and address when supplied.
- The Arabic privacy and terms pages are translations of the English ones. Have the lawyer review both languages together.
- Trust details a buyer expects and the site does not yet show: commercial registration, recruitment licence, city/office, and any client or project references the client is happy to publish.
- Have a native Arabic speaker read `ar/index.html` once (marked changes: ministry names, "النظافة والخدمات المساندة" for housekeeping, hero line).
- The social image `assets/img/og-image.png` is 1024x538; the tags declare that size. A 1200x630 version would be better for large previews.

## Notes

- The mobile menu uses `inert` on the page behind it, moves focus in, closes on Escape and restores focus.
- Without JavaScript the navigation links stay visible and the form posts normally to `/api/contact` (the function returns a small HTML page).
- Theme preference is the only thing stored (localStorage key `mz-theme`). No cookies are set.

---

## Deployment (from previous version)

### Create the GitHub repository

```bash
cd maazaia-site
git init
git add .
git commit -m "Initial Maazaia website"
git branch -M main
git remote add origin https://github.com/<your-org>/maazaia-site.git
git push -u origin main
```

### Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** → authorise GitHub → pick `maazaia-site`.
2. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *leave empty*
   - **Build output directory:** `/`
   - **Root directory:** `/`
3. **Save and Deploy.** First build takes under a minute. You get
   `maazaia-site.pages.dev`, plus a preview URL for every future branch and pull request.
4. Add the environment variables from the Contact form section above, then **Retry deployment** so the Functions pick them up.

Every push to `main` redeploys automatically. Pages Functions in `/functions` are detected
and deployed with no extra configuration.

### Point maazaia.com at it

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