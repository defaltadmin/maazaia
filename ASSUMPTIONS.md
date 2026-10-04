# ASSUMPTIONS.md — resolved

**Status as of 2026-10-04: every fabricated fact listed previously has been
removed from the site. Nothing on maazaia.com is invented any more.**

The previous version of this file tracked placeholder company data. Rather than
keep a list of things that are no longer published, this file now records what
was removed and what you need to supply if you want it back.

## What was removed, and why

| Removed | Reason |
|---|---|
| Phone `+966 11 000 0000`, WhatsApp number | Never a working number |
| Postal address (Al Murooj Tower, Riyadh) and map coordinates | Fabricated |
| Offices in Riyadh / Jeddah / Dammam | Fabricated |
| MHRSD licence and commercial registration numbers | Fabricated |
| "Licensed by MHRSD", "WPS-compliant" | Claims that cannot be made without the real licence |
| Statistics: 4,000+ workers, 9 source markets, 21-day mobilisation, 96% renewal | Invented |
| "Founded [YEAR]", company origin narrative | Invented |
| Leadership names | Placeholders, no real people |
| `sales@`, `careers@`, `privacy@` mailboxes | Not confirmed to exist |
| Business hours | Assumed, never confirmed |

**Contact is now email only:** `info@maazaia.com`. Every CTA on the site is a
`mailto:` link. This is intentional — one channel is easier to keep correct.

## What you can add back, once real

Nothing is blocked; these are just the things that make a company site
convincing when you have the actual values:

1. **Licence and CR numbers.** Trust badges for manpower suppliers matter in this
   sector. Put them on the homepage and in the legal pages once issued.
2. **A real phone number.** Especially WhatsApp — it is how Saudi labour
   supply actually runs.
3. **An office address.** Needed for `EmploymentAgency` JSON-LD `address` and
   `geo`, and for Google Business Profile.
4. **Business hours.** Useful in the footer and in structured data.
5. **Real numbers, if you have them.** Even two or three credible figures
   ("X workers deployed since YYYY") outperform nothing, provided they are true.
6. **Photography.** There is no imagery on the site. Real photos of crews and
   sites would change the impression more than any design change.

## Still outstanding

- The logo (`assets/img/logo-placeholder.svg`) is a placeholder "M" mark.
- The Arabic name **مازايا** needs confirming against the registered name.
- `privacy.html` is drafted against the PDPL but has not been reviewed by Saudi
  counsel, and the retention periods in it are drafting defaults, not legal
  advice.
- Arabic copy is original MSA written for this site. A native Saudi reviewer
  should check the trade names and job titles.

## A. Branding (no assets were provided)

| # | Assumption | Where |
|---|---|---|
| A1 | Palette: deep teal-green `--brand` + desert-ochre `--accent` on warm sandstone. Chosen to read as professional and regional without defaulting to navy-and-gold corporate or Saudi-flag green. | `assets/css/styles.css` `:root` |
| A2 | Typography: IBM Plex Sans Arabic for both scripts (one family, real Arabic support, clean hierarchy), with Newsreader italic for editorial numerals in English only. | `--sans`, `--serif` |
| A3 | Logo is a placeholder "M gate" mark plus the wordmark "Maazaia" / "مازايا". | `assets/img/*`, inline SVG in every header and footer |
| A4 | Arabic name transliterated as **مازايا**. Confirm the registered Arabic name. | all `ar/*.html` |
| A5 | Tagline "Manpower & Recruitment" / "القوى العاملة والتوظيف". | `COMMON.brand_sub` usage in headers |
| A6 | Social share image is generated art, not a photograph. There is no photography anywhere on the site: add real site and crew photos when you have them, ideally shot in the Kingdom. | `assets/img/og-image.png` |

## B. Company facts (all fabricated placeholders)

| # | Assumption | Where |
|---|---|---|
| B1 | Legal name "[Maazaia Company for Manpower Supply LLC]". | `about.html`, `privacy.html`, `terms.html` |
| B2 | CR number `[10XXXXXXXX]`, MHRSD manpower supply licence `[XXXXXX]`, separate recruitment licence, VAT number, Riyadh Chamber membership, Nitaqat band. | `about.html` credentials table, footer of every page |
| B3 | Founded `[YEAR]`, started in construction labour supply in the Central Region, later expanded into FM, industrial and hospitality. Pure narrative invention. | `about.html` |
| B4 | Offices in **Riyadh (head office), Jeddah and Dammam**. | homepage credentials strip, `about.html`, `contact.html` |
| B5 | Address "Office 402, Al Murooj Tower, King Fahd Branch Road, Al Olaya, Riyadh 12333". Map coordinates point at Al Olaya, Riyadh, not a real Maazaia office. | `contact.html`, footer, JSON-LD, `c_common` CONTACT |
| B6 | Phone `+966 11 000 0000`, WhatsApp `+966 50 000 0000`. Deliberately non-working numbers. | footer, `contact.html`, `employers.html` |
| B7 | Email addresses `info@`, `sales@`, `careers@`, `privacy@` at maazaia.com. Create these mailboxes or change them. | everywhere |
| B8 | Working hours Sunday to Thursday, 09:00 to 18:00 AST. | footer, JSON-LD, `contact.html` |
| B9 | Leadership section lists four `[Full Name]` placeholders. Replace with real people or delete the section. | `about.html` |
| B10 | Headline statistics: 4,000+ workers deployed, 9 source markets, 21-day average mobilization, 96% renewal rate. **Invented.** Do not publish unverified numbers; the page carries a visible note saying so. | `index.html`, `ar/index.html` |
| B11 | "Sourcing in 9 countries", "India to the Philippines". | homepage, `services.html` |

## C. Services (realistic for the sector, not confirmed for Maazaia)

| # | Assumption | Where |
|---|---|---|
| C1 | Five services: manpower outsourcing, recruitment & executive search, payroll & HR outsourcing, visa/iqama/sponsorship support, on-site workforce management. | `services.html`, homepage |
| C2 | Maazaia acts as **employer of record** on its own sponsorship for outsourced labour, and can also recruit onto client sponsorship. These are very different licences and commercial models: confirm which you actually hold. | homepage FAQ, `services.html`, `terms.html` |
| C3 | Ajeer-compliant contracts, WPS payroll via Mudad or bank upload, GOSI registration, Qiwa contract authentication, Muqeem/Absher transactions. Standard KSA practice, but confirm which you operate directly versus through an agent. | throughout |
| C4 | Commercial claims: replacement cover written into contracts, probation-period replacement guarantee on permanent hires, reply within one business day, weekly progress reporting, supervision recommended above 25 workers. **Service promises: only keep what you will honour.** | `employers.html`, `services.html`, homepage |
| C5 | Mobilization timelines: days for transferable-iqama candidates in Kingdom, 4 to 10 weeks for overseas recruitment. | homepage FAQ, `services.html` |
| C6 | Accommodation, transport, PPE, HSE induction and attendance reporting offered as extras. | `services.html` |
| C7 | Candidate files kept active for 12 months. This number must match the retention table in the privacy policy if you change it. | `jobseekers.html`, `privacy.html` |

## D. Industries (placeholder list)

| # | Assumption | Where |
|---|---|---|
| D1 | Eight sectors: construction & infrastructure, facilities management & cleaning, oil/gas/petrochemicals, hospitality & catering, healthcare support, retail & malls, logistics & warehousing, manufacturing & industrial. | `industries.html`, homepage |
| D2 | Construction described as "our largest book" and linked to gigaproject subcontracting. | `industries.html` |
| D3 | Specific trades listed per sector (6G welders, steel fixers, shutter carpenters, forklift operators…). Realistic, but they imply you can actually source them. | `industries.html` |
| D4 | Healthcare staffing noted as subject to SCFHS classification, and hospitality demand tied to Hajj, Umrah and Riyadh Season. | `industries.html` |
| D5 | Ten job categories in the application form dropdown. | `jobseekers.html` |

## E. Legal & compliance

| # | Assumption | Where |
|---|---|---|
| E1 | The privacy policy is written as a **complete PDPL policy** and cites the PDPL (Royal Decree M/19 of 1443H as amended by M/148 of 1444H), its Implementing Regulations, the data transfer regulation, SDAIA as regulator, 30-day request response and 72-hour breach notification. It reflects the law as understood at the time of writing and still needs review by Saudi counsel against your actual processing. | `privacy.html`, `ar/privacy.html` |
| E2 | Retention periods (12/24 months for candidates, employment +5 years, payroll 10 years, enquiries 24 months, logs 12 months) are **drafting defaults**, not legal advice. Confirm against your record-keeping obligations. | `privacy.html` §8 |
| E3 | Stated practices we assume you will actually implement: encryption at rest for CVs, role-based access, DPAs with every processor, privacy impact assessments, privacy training, access logging. Do not publish these until they are true. | `privacy.html` §9 |
| E4 | Assumed processors: Cloudflare (hosting, Turnstile), Resend (email), Google Fonts and Google Maps. Change the list if your stack differs. | `privacy.html` §5, §6 |
| E5 | Registration reference on the National Data Governance Platform left as `[registration reference]`. | `privacy.html` §1 |
| E6 | No data protection officer is named. Appoint one if your processing volume requires it, then fill in §15. | `privacy.html` §15 |
| E7 | Terms cap website liability at SAR 1,000 and give Riyadh courts jurisdiction, with the Arabic text prevailing. Commercially normal, legally your call. | `terms.html` §8, §10 |
| E8 | "Last updated 22 September 2026, Version 1.0" on both legal pages. Update on every edit. | `privacy.html`, `terms.html` |
| E9 | Anti-fraud statement assumes Maazaia only contacts candidates from `@maazaia.com` addresses and published numbers. | `terms.html` §4, `jobseekers.html` |

## F. Technical decisions

| # | Decision | Why / what to check |
|---|---|---|
| F1 | Plain HTML with no build step, English at the root and Arabic under `/ar/`. | Simplest correct setup for Pages and for hreflang. Trade-off: header and footer markup repeat in all 20 files. |
| F2 | Email via **Resend**. | MailChannels' free Cloudflare route was withdrawn in 2024. Swap `sendMail()` for any provider. Requires a verified sending domain. |
| F3 | Turnstile **test** site key is committed (`1x00000000000000000000AA`). | Forms work immediately in dev and would silently accept bots in production. Replace it. |
| F4 | CVs are emailed as attachments and not stored. | Add R2 if you need an archive, and update the retention table. |
| F5 | Google Maps is click-to-load; Google Fonts load normally. | If you want zero Google requests, self-host the two font families and drop the `fonts.googleapis.com` entries from `_headers` CSP. |
| F6 | Canonical host is the apex `https://maazaia.com`. | If you prefer `www`, update the canonical and `og:url` tags, `sitemap.xml`, `robots.txt` and the redirect rule. |
| F7 | One shared `404.html` in English. | Cloudflare Pages serves a single not-found page; an Arabic 404 would need a Pages Function to branch on path. |
| F8 | `<lastmod>` in the sitemap is a fixed date. | Update it when content changes, or generate the sitemap in CI. |
| F9 | Arabic copy is original MSA written for this site, not machine translation of the English. | Still have a native Saudi reviewer read it, especially job titles and trade names. |
| F10 | Hijri dates, prayer-time notices and a Saudi holiday calendar are not included. | Add if the business wants them. |
