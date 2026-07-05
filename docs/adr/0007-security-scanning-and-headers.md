# 7. Security scanning and headers

## Status

Accepted

## Context

No secret scanning, no static security analysis (SAST), and zero HTTP
security headers existed anywhere in the project - `deploy.yml` handles
real credentials (`FTP_SERVER`/`FTP_USERNAME`/`FTP_PASSWORD` secrets) with
no scan ever having run to confirm none had leaked into the repo. The site
also serves through Apache (HostGator), a plain static host with no
Node/Nginx layer to attach middleware-style headers to.

## Decision

- **CodeQL** (`.github/workflows/codeql.yml`): `javascript-typescript` +
  `security-extended` queries, on push/PR/weekly schedule. Standalone
  workflow rather than a job inside `quality.yml`, matching GitHub's own
  convention and avoiding edits to a shared file.
- **gitleaks**: `gitleaks protect --staged` in the `pre-commit` hook
  (skips gracefully if not installed locally, see ADR 3) plus
  `.github/workflows/gitleaks.yml` in CI via the official action. Ran
  `gitleaks detect` against the full commit history before adding any of
  this - no leaks found.
- **`public/.htaccess`** security headers for the Apache/HostGator
  deploy: CSP, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`. The CSP's `script-src` and
  `style-src` both need `'unsafe-inline'`: a real production build shows
  Astro inlines `nor-where-to-find-him`'s `<script type="module">`
  directly into the HTML (not every page's scripts get extracted to
  external files), and `Courses.astro`'s chart containers use inline
  `style=""` attributes. Tightening either means changing how those are
  authored - a code change, not just a header - so `'unsafe-inline'` was
  accepted as a scoped tradeoff rather than blocked on that refactor.

## Consequences

- A real secret committed from now on gets caught locally (if gitleaks is
  installed) and always in CI before merge.
- CodeQL findings show up as GitHub code scanning alerts, not blocking
  anything by default - someone needs to actually look at the Security
  tab periodically.
- The CSP is meaningfully tighter than "nothing" (blocks framing via
  `frame-ancestors 'none'`, restricts `object-src`/`base-uri`/
  `form-action`, whitelists exactly the two external hosts the site
  actually loads from - `cdn.jsdelivr.net` for ECharts,
  `fonts.googleapis.com`/`fonts.gstatic.com` for Google Fonts) but
  `'unsafe-inline'` on script-src means it does **not** meaningfully
  block inline-script-injection XSS. Closing that gap requires moving the
  inlined script to an external file (or a nonce/hash strategy that
  survives every build) - future work, not done here.
- None of the header behavior could be tested in the sandbox this was
  built in - `.htaccess` only means anything under real Apache, and
  `astro preview` ignores it entirely. Verify via the browser console for
  CSP violations after the first real deploy.
