# 8. Accessibility tooling and thresholds

## Status

Accepted

## Context

No static or runtime accessibility checking existed. `eslint-plugin-astro`
recommends pairing with `eslint-plugin-jsx-a11y` for `.astro` template
checks, but `eslint-plugin-jsx-a11y`'s `peerDependencies` only lists
`eslint: ^3 || ... || ^9` - this project is on ESLint 10. Separately, the
existing Playwright e2e smoke suite (ADR 4) already ran `@axe-core/playwright`
scoped to `impact === 'critical'` only.

## Decision

- Installed `eslint-plugin-jsx-a11y` with `--legacy-peer-deps` and
  verified directly that it runs correctly against ESLint 10 despite the
  stale peer range (no crash, no broken rule behavior) before relying on
  it - added `eslintPluginAstro.configs['flat/jsx-a11y-recommended']` to
  `eslint.config.js`.
- `--legacy-peer-deps` only affected that one local install - it doesn't
  persist, so every subsequent plain `npm install`/`npm ci` (a fresh
  clone, CI, the `post-merge` hook after pulling this change) failed with
  `ERESOLVE` until `.npmrc` (`legacy-peer-deps=true`) was added so the
  setting applies project-wide, automatically, for every npm invocation.
  This was caught only after it broke `npm ci` in CI and the
  `post-merge` hook for a real merge - see `fix/npm-install-eresolve`.
- Fixed every violation it found rather than suppressing any: two
  unlabeled form controls, four redundant "Image of .../... image" alt
  text patterns, two redundant explicit ARIA roles duplicating implicit
  ones. See the `feat: add static a11y linting...` commit for specifics.
- Kept the Playwright axe assertion scoped to `critical` severity only,
  but now attaches every violation (any severity) found as a test report
  artifact regardless of pass/fail. A full-repo survey after the ESLint
  fixes above found zero violations of any severity except `serious`
  `color-contrast` failures on 8 project pages - all from per-project
  brand accent colors (`primaryColor`/`secondaryColor` per project in
  `[project].astro`), which needs a deliberate design pass across those
  colors, not a code fix. Raising the assertion to `serious` today would
  fail CI for a design decision, not a regression.

## Consequences

- `npm run lint` now catches new unlabeled-control/redundant-alt/
  redundant-role mistakes before they ship, on every `.astro` file.
- The ESLint peer-dependency mismatch is a ticking clock: if
  `eslint-plugin-jsx-a11y` ever publishes a breaking change assuming
  ESLint <10 behavior, `--legacy-peer-deps` won't save it - revisit if
  `npm run lint` starts erroring out of nowhere, and check whether
  `eslint-plugin-jsx-a11y` has added ESLint 10 to its peer range by then.
- Color contrast on project pages is a known, tracked gap (visible via
  the axe attachment in CI, not silent) but not yet fixed - whoever picks
  it up should treat it as a color/design decision per project, not a
  single global fix.
