# 4. Testing strategy

## Status

Accepted

## Context

No test runner, no test files existed. The two most fragile pieces of
logic (`src/scripts/validation.js`, `src/scripts/charts.js`, both flagged
in `IMPROVEMENTS.md`) had zero exported functions - everything was private
module-scope code wired up via side effects on import, which is the
opposite of testable. Content Collections (`src/content.config.ts`) had
Zod schemas that had never actually been checked against the real JSON
files feeding them.

## Decision

See [`docs/architecture.md#test-strategy`](../architecture.md#test-strategy)
for the layer diagram this section describes.

- **Unit**: Vitest with jsdom. Exported the previously-private pure
  functions from `validation.js` (`setError`, `setSuccess`,
  `validateEmailOnKeyUp`, ...) and `charts.js` (`generateYears`,
  `generateRandomData`, `generateGrowingData`) purely so they're callable
  from a test - no behavior change. Fixed the email regex's `{2,4}` TLD
  length limit while touching that file, since it was already flagged in
  `IMPROVEMENTS.md` and directly testable.
- **Integration**: `vitest.config.ts` uses Astro's `getViteConfig()` so
  `astro:content` resolves in tests. Tests call the real
  `getCollection('projects')` against the real JSON files, so a schema
  mismatch fails a test instead of failing silently at build time.
- **E2E**: Playwright against a real `astro build` + `astro preview`
  (not dev mode), covering every generated page (derived from
  `src/content/projects/*.json` and the known static routes, not
  hand-maintained) for: HTTP status, page title, zero console/page
  errors, and `@axe-core/playwright` accessibility checks.
- Found and left two things failing on purpose rather than relaxing the
  assertions to hide them: missing `cascadia-mono.woff`/`.woff2` font
  files (404 on two pages), and `color-contrast` violations on 8 project
  pages from per-project brand colors (see ADR 8) - both are real,
  pre-existing gaps that a green test suite shouldn't paper over.

## Consequences

- The two known e2e failures mean `npm run test:e2e` is not fully green
  today, on purpose - fixing them (sourcing real font files; a color
  contrast pass across project brand colors) is real, separate work, not
  something to silently work around in test code.
- Exporting previously-private functions is a very small API surface
  change to two files; nothing else imports them differently.
- Content Collection integration tests will fail the moment someone
  edits a project JSON in a way that breaks its schema - that's the
  point, but it means schema changes and content changes are coupled in
  a way they weren't before (silently).
