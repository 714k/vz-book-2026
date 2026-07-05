# 5. CI quality gate blocks deploy

## Status

Accepted

## Context

`.github/workflows/deploy.yml` (FTP deploy to HostGator on push to `main`)
had, until this work, **never actually been committed to git** - it only
existed on disk locally. There was no CI at all: no lint, no type-check, no
tests running before a deploy. The build itself was silently broken (a
placeholder `<script src="/my-analytics-script.js">` pointing at a file
that doesn't exist made `astro build` fail unconditionally) and nobody had
noticed, because nothing had ever run the build in anger outside a local
`npm run dev`.

## Decision

See [`docs/architecture.md#quality-gates-over-time`](../architecture.md#quality-gates-over-time)
for the full local-hook-to-deploy sequence this section describes.

- `.github/workflows/quality.yml`: reusable workflow (`workflow_call`),
  runs on every PR - `lint`, `format:check`, `stylelint`, `typecheck`,
  `test:coverage`, `e2e` (all blocking), plus `audit` (non-blocking, see
  below).
- `deploy.yml` now calls `quality.yml` as a job (`needs: quality`) before
  the FTP deploy step - a failing quality gate blocks the deploy, not just
  the check.
- `npm audit --audit-level=high` runs but is `continue-on-error: true`.
  As of writing, the 9 high-severity advisories are all inside Astro's own
  dependency tree (vite/rollup/svgo/h3/picomatch) with no fix available
  short of a major Astro upgrade - blocking deploy on a risk we don't
  control, indefinitely, isn't worth the tradeoff. Revisit this once
  Astro ships updated deps or the vulnerable transitive deps in this list.

## Consequences

- Every push to `main` from now on gets built, linted, type-checked, and
  tested before FTP even runs - the site can't be deployed broken again
  the way it already was once.
- Merging to `main` directly (not via PR) still bypasses PR-time checks
  because there's no branch protection rule requiring status checks yet
  - see `CONTRIBUTING.md` for the recommended GitHub setting, which
    can't be applied from this repo's code.
- `npm audit` staying non-blocking means a real, fixable advisory in a
  _direct_ dependency could land unnoticed until someone reads the CI
  logs - worth tightening this to fail only on direct-dependency
  advisories once that becomes possible to express cleanly.
