# Improvement Roadmap

Findings from a staff-engineering-level review of this project (code + look &
feel), 2026-07-02. Grouped by priority. Check items off as they're done.

Updated 2026-07-05: most of "Critical" and several "Correctness"/"Polish"
items were resolved while building out the code quality strategy (see
[`docs/adr/`](docs/adr/README.md) for the reasoning behind each). New
findings discovered along the way are in their own section below.

## Critical — table stakes

- [x] **Initialize git and push real history.** Done.
- [x] **Add CI.** `.github/workflows/quality.yml` (lint, typecheck, tests,
      e2e, non-blocking audit) runs on every PR; `deploy.yml` - which had
      never actually been committed to git before this, so the FTP deploy
      was never really live - now calls `quality.yml` as a gate before
      deploying. See [ADR 0005](docs/adr/0005-ci-quality-gate-blocks-deploy.md).
- [x] **Add linting/formatting enforcement.** ESLint (`typescript-eslint`
      strict + `eslint-plugin-astro` + `eslint-plugin-jsx-a11y`), Prettier,
      Stylelint, all wired into `quality.yml` and pre-commit. See
      [ADR 0002](docs/adr/0002-linting-and-formatting-stack.md).
- [x] **Add tests.** Vitest (unit for `validation.js`/`charts.js`,
      integration for Content Collections vs their Zod schemas) and
      Playwright (e2e smoke suite over every generated page + axe a11y).
      See [ADR 0004](docs/adr/0004-testing-strategy.md).

## Architecture

- [x] **Collapse the 20+ duplicated project pages into one dynamic route.**
- [x] **Move `src/data/*.json` into Astro Content Collections with a Zod
      schema.**
- [ ] **Remove dead/commented-out code left mid-migration.** Partially
      done: the _unused imports and variables_ feeding the commented-out
      `<TOC>`/`<ProjectGallery>` usage in `Project.astro` were removed (they
      were causing real `no-unused-vars` lint errors), but the commented-out
      JSX itself is still there - still needs a decision to finish wiring
      them up or delete the comments outright.
- [ ] **`ProjectsNavigation.astro` is dead code.** Discovered while adding
      e2e tests: this component is never imported anywhere in `src/`. The
      real prev/next navigation on project pages is rendered by
      `Footer.astro` (`a.left`/`a.right`), fed by `[project].astro`'s
      hardcoded `projects` array - not by this component or by each
      project JSON's own `projectsNavigation` field, which is _also_
      unused by anything except a slugification check in the integration
      test. Worth deciding which of the two competing prev/next
      mechanisms (`[project].astro`'s hardcoded array vs. per-project
      `projectsNavigation` JSON) is the source of truth and removing the
      other.
- [ ] **`src/layouts/Base.astro` is dead code.** Noticed while documenting
      the layouts: nothing in `src/` imports it. `BookPage.astro` (the
      layout all 11 pages actually use) carries its own
      `<html>`/`<head>`/`<body>`, so the two overlap rather than compose -
      `Base.astro` looks like the remains of the Jekyll migration. Either
      delete it, or make `BookPage` wrap it so the `<head>`/SEO tags live
      in one place.

## Correctness / integrity

- [ ] **Stop generating random chart data on every page load.** Still
      open - `generateRandomData`/`generateGrowingData` in `charts.js` are
      now unit-tested (asserting shape/bounds, not real values) but still
      use `Math.random()`.
- [ ] **Stop loading ECharts from a CDN at runtime.** Still open. Also now
      has a `size-limit` budget (`dist/assets/*.js` <= 20 KB) that would
      immediately catch how much this adds if it's ever bundled locally -
      see [ADR 0009](docs/adr/0009-performance-budgets.md).
- [ ] **Resolve the contact form's dependency on `validation.php`.** Still
      open.
- [x] **Fix the hand-rolled email regex** in `validation.js` - widened the
      TLD length limit past 4 chars. (The `lastIndex`/reused-`/g`-object
      concern didn't actually apply to the live file - the regex is
      constructed fresh on every call - so nothing needed fixing there.)

## Polish

- [x] **Add `engines` to `package.json`** matching `.nvmrc`.
- [x] **Add accessibility/performance auditing.** Both landed:
      `@axe-core/playwright` in the e2e suite (fails on `critical`
      violations, reports everything else - see
      [ADR 0008](docs/adr/0008-accessibility-tooling-and-thresholds.md))
      and Lighthouse CI (`lighthouserc.json` - see
      [ADR 0009](docs/adr/0009-performance-budgets.md)).

## Look & feel

The dark retro-terminal/sci-fi aesthetic (per-project accent colors via CSS
vars, monospace headings, the "spaceship control panel" decoration on the
contact page, ASCII-pattern chart backgrounds) is distinctive and clearly not
a template — keep it. The gaps below are finishing touches, not a redesign.

- [ ] **Fix the mobile type scale.** Still open.
- [ ] **Drop `background-attachment: fixed`** from the `cover` mixin.
      Still open.
- [ ] **Run project images through `astro:assets`.** Still open.
- [ ] **Add a loading state for the charts section.** Still open.
- [x] **Fix `margin: var(--spcaing-0);` typo** in `src/styles/main.scss` -
      fixed while cleaning up Stylelint findings; this one was silently
      invalidating `body`'s intended margin, not just a style nit.
- [ ] **Remove the dead `fontface` mixin** in `src/styles/mixins.scss`.
      Still open - not touched by the quality-tooling work.

## Discovered while building the code quality strategy (2026-07-05)

Real findings the new tooling surfaced that weren't fixed outright, either
because fixing them is a bigger/riskier change than "add the tool," or
because it's a design decision rather than a code bug. Each is tracked
(failing test, non-blocking CI report, or a disabled lint rule with a
comment) rather than silently ignored - see the referenced ADR for the
full reasoning.

- [ ] **Missing font files.** `cascadia-mono.woff`/`.woff2` don't exist,
      causing two pages to 404 on them - `test/e2e/smoke.spec.ts` fails on
      purpose for `/at-the-beginning/no-one-knows/the-fixer/` and
      `/at-the-beginning/nor-where-to-find-him/` until the real files are
      sourced (or the `@font-face` rules referencing them are removed).
- [ ] **Color contrast on 8 project pages.** axe reports `serious`
      `color-contrast` violations on `aventuras-enmascaradas`, `next-gen`,
      `hbo`, `query-technologies`, `plastiq`, `seccion-amarilla`, `sonora`,
      `saffron` - all from per-project brand accent colors
      (`primaryColor`/`secondaryColor` in `[project].astro`). Needs a
      deliberate contrast pass across those colors; visible as a non-
      failing test report attachment in CI, not currently blocking. See
      [ADR 0008](docs/adr/0008-accessibility-tooling-and-thresholds.md).
- [ ] **CSP needs `'unsafe-inline'`.** `public/.htaccess`'s
      Content-Security-Policy can't fully lock down `script-src`/
      `style-src` because Astro inlines `nor-where-to-find-him`'s
      `<script type="module">` directly into the HTML (not every page's
      scripts get extracted to external files) and `Courses.astro`'s chart
      containers use inline `style=""` attributes. Closing this needs
      either moving that script to an external file or a nonce/hash
      strategy that survives every build. See
      [ADR 0007](docs/adr/0007-security-scanning-and-headers.md).
- [ ] **9 high-severity `npm audit` advisories**, all inside Astro's own
      dependency tree (vite/rollup/svgo/h3/picomatch) - no fix available
      short of a major Astro upgrade. `audit` runs in `quality.yml` but is
      `continue-on-error`. Revisit once Astro ships updated deps. See
      [ADR 0005](docs/adr/0005-ci-quality-gate-blocks-deploy.md).
- [ ] **SonarQube isn't wired into CI yet.** `docker-compose.sonar.yml` and
      `sonar-project.properties` exist and work locally; the `quality.yml`
      job is documented but not added, gated on a real server existing
      (`secrets.SONAR_HOST_URL`). See
      [ADR 0006](docs/adr/0006-self-hosted-sonarqube.md) and
      `docs/sonarqube.md`.
- [ ] **GitHub branch protection isn't configured.** `main` has no rule
      requiring PRs or passing status checks before merge - the CI gate
      blocks `deploy.yml`, but a direct push to `main` still bypasses PR-time
      checks entirely. This is a repo _setting_, not something fixable from
      code - see `CONTRIBUTING.md` for the exact settings to turn on.
- [x] **Duplicate `tooltip` key silently discarding `trigger: 'item'`** in
      `charts.js`'s pie chart config - fixed.
- [x] **27 pre-existing `astro check` type errors** (never run before) -
      all fixed: several hand-written prop interfaces (`TOC`,
      `ProjectBrief`, `Adventures`, `ProjectSummary`, `Ammos`) had drifted
      from the real Zod schemas; `getEntry(..., 'data')` calls needed a
      `getRequiredEntry` helper (`src/lib/content.ts`) since TypeScript
      correctly flags them as possibly `undefined`.
- [x] **8 real accessibility violations** (`eslint-plugin-jsx-a11y`): two
      unlabeled form controls, four redundant "Image of .../... image" alt
      text patterns, two redundant explicit ARIA roles - all fixed. Also
      fixed an unrelated bug found in the same pass: the Aeris section's
      image had `alt="Sample of project Plastiq"` - wrong project name.
- [x] **`public/assets/js/**` and `src/scripts/validation-soso.js`** were
      dead duplicates of `src/scripts/*` (confirmed via grep - nothing
      references them), and `public/assets/css/styles.scss` was a
      corrupted leftover (literal `---` Astro frontmatter fences pasted
      into a `.scss` file) - all removed.
- [x] **Production build was completely broken.** A PROD-only
      `<script src="/my-analytics-script.js">` in `Default.astro`
      referenced a `public/` asset that was never added; Astro refuses to
      bundle a `public/` asset without `is:inline`, so `astro build` failed
      unconditionally. Nobody had noticed because there was no CI running a
      real build before this. Removed the placeholder.

## Suggested order

Everything in "Critical" is done. What's left, roughly in order of
impact-to-effort:

1. Source the real `cascadia-mono` font files (or drop the `@font-face`
   rules referencing them) - fixes two failing e2e tests for cheap.
2. Decide the `ProjectsNavigation.astro` vs. per-project
   `projectsNavigation` JSON question and delete whichever loses.
3. Replace the random chart data with real numbers and move ECharts to a
   real dependency (checking `size-limit` doesn't blow past 20 KB).
4. Color contrast pass across the 8 flagged project pages.
5. Mobile type scale + `astro:assets` image pipeline (biggest visible wins
   for the least effort).
6. Turn on GitHub branch protection for `main` (5-minute settings change,
   closes the direct-push bypass).
