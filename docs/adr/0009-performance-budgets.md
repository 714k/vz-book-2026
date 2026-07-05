# 9. Performance budgets

## Status

Accepted

## Context

No performance tracking existed - no Lighthouse runs, no bundle size
checks. `IMPROVEMENTS.md` already flagged that `charts.js` loads ECharts
from a CDN with no version pinning/SRI/bundling, which is exactly the kind
of thing that can silently bloat shipped JS if "fixed" naively (bundling
ECharts locally instead of via CDN would add hundreds of KB to the JS that
today ships almost nothing).

## Decision

- `lighthouserc.json`: runs Lighthouse against a real `astro build` output
  (`staticDistDir`, not a live dev/preview server) for 3 representative
  pages (home, a section index, a project page). `categories:accessibility`
  is a hard `error` at `>=0.9`; performance/best-practices/seo are `warn`
  at lower thresholds - this is the _first_ time Lighthouse has ever run
  against this site, so failing the build on a score that's never been
  measured before risked being noise rather than signal. All 3 sampled
  pages already pass every assertion as-is.
- `size-limit` + `@size-limit/file` on `dist/assets/*.js`, budget set at
  20 KB (current: ~2 KB brotli'd) - loose enough not to block normal
  growth, tight enough to catch someone bundling ECharts locally without
  realizing the size implications.
- Neither is wired into CI yet, same reasoning as ADR 6 (SonarQube): avoid
  multiple concurrent PRs editing `quality.yml`.

## Consequences

- Lighthouse's `warn`-level assertions mean a real performance regression
  won't fail CI today, only get flagged - intentionally soft until there's
  a baseline worth defending with a hard failure. Revisit once this has
  run in CI for a while and the scores are known-stable.
- The 20 KB size-limit budget is a guess, not a measured target - it'll
  need revisiting the moment ECharts (or anything else non-trivial) is
  bundled instead of CDN-loaded.
- Both commands need a real Chrome/Chromium binary
  (`CHROME_PATH` env var if it's not on the default `PATH`) - documented
  in the commit but not yet automated in a setup script.
