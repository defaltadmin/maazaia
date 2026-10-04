"""Simulate the production CSP locally and confirm nothing is blocked.

python -m http.server cannot be configured with headers, so this checks
the HTML directly for the two patterns that the real policy forbids:
inline <script> bodies and inline on* event handler attributes.
"""
import io, re, sys, os, glob

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
os.chdir(r"C:\Users\user\AI\projects\maazaia")

# script-src has no 'unsafe-inline' and no 'unsafe-hashes'
HANDLERS = re.compile(r'\son(?:load|click|error|change|submit|input|mouseover)'
                      r'=|javascript:')

bad_total = 0
for page in sorted(glob.glob("*.html") + glob.glob("ar/*.html")):
    src = io.open(page, encoding="utf-8").read()
    problems = []

    # inline script bodies (a <script> with neither src nor a JSON type)
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", src, re.S):
        attrs, body = m.group(1), m.group(2)
        if "src=" in attrs:
            continue
        if 'application/ld+json' in attrs:
            continue          # data blocks are not executed
        if body.strip():
            problems.append("inline <script> body")

    # inline event handler attributes
    for m in HANDLERS.finditer(src):
        problems.append(f"inline handler {m.group(0)!r}")

    # styles: style-src DOES allow 'unsafe-inline', so inline <style> is fine
    # but must be checked separately
    bad_total += len(problems)
    print(f"  {page:22} {'CSP-CLEAN' if not problems else '; '.join(problems)}")

print()
# confirm the policy itself really lacks unsafe-inline
h = io.open("_headers", encoding="utf-8").read()
csp = [l for l in h.splitlines() if l.strip().startswith("Content-Security-Policy")]
if not csp:
    print("  !! no CSP found in _headers")
else:
    line = csp[0]
    script_src = re.search(r"script-src ([^;]+)", line).group(1)
    style_src = re.search(r"style-src ([^;]+)", line).group(1)
    print("  script-src:", script_src.strip())
    print("  style-src :", style_src.strip())
    print()
    print("  script-src allows unsafe-inline:",
          "unsafe-inline" in script_src, "(must be False)")
    print("  Cloudflare Insights allowed    :",
          "static.cloudflareinsights.com" in script_src, "(must be True)")

print("\n" + "=" * 60)
print("CSP BLOCKAGE RISK:", "none" if bad_total == 0 else f"{bad_total} issues")
print("=" * 60)