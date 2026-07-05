# Improvement Roadmap

Findings from a staff-engineering-level review of this project (code + look &
feel), 2026-07-02. Grouped by priority. Check items off as they're done.

## Critical — table stakes

- [ ] **Initialize git and push real history.** The project currently has no
      `.git` — no history, no branches, no PR review trail, no CI is possible
      until this exists. Do this first; everything below assumes it.
- [ ] **Add CI.** A GitHub Actions workflow (or equivalent) that runs on every
      push/PR: `astro check` (type-check), lint, and `astro build`.
- [ ] **Add linting/formatting enforcement.** No ESLint/Prettier/Stylelint
      config exists today. Wire one up and run it in CI, not just the editor.
- [ ] **Add tests.** No test runner or test files exist. Start with the pure
      logic that's easiest to break silently: `src/scripts/validation.js`
      (form validation) and `src/scripts/charts.js` (data shaping).

## Architecture

- [x] **Collapse the 20+ duplicated project pages into one dynamic route.**
      `src/pages/.../nobody-knows-he-worked-on/*.astro` is ~20 near-identical
      files (aeris.astro, hbo.astro, cars.astro, ...) that only differ by
      color, image paths, and prev/next links. Replace with a single
      `[project].astro` using `getStaticPaths()`, generating prev/next from an
      ordered list instead of hand-wiring it per file.
- [x] **Move `src/data/*.json` into Astro Content Collections with a Zod
      schema.** Gets typed, validated data instead of the current
      `project?: any` in `Project.astro` and the template-literal dynamic
      import (`import(`../data/${projectName}.json`)`) that defeats Vite's
      static analysis and silently swallows failures into `console.error`.
- [ ] **Remove dead/commented-out code left mid-migration**, e.g. the
      commented-out `<TOC>` and `<ProjectGallery>` usage in `Project.astro`.
      Either finish wiring them up or delete them.

## Correctness / integrity

- [ ] **Stop generating random chart data on every page load.**
      `src/scripts/charts.js`'s `generateRandomData`/`generateGrowingData`
      use `Math.random()` for the "Courses By Type" chart — inconsistent with
      every other data-driven part of the site and misleading if a visitor
      takes the numbers at face value. Replace with real data from JSON, same
      pattern as the rest of the site.
- [ ] **Stop loading ECharts from a CDN at runtime.** `charts.js` does
      `import('https://cdn.jsdelivr.net/...')` — no version pinning beyond
      the URL, no SRI, no offline/CDN-failure handling, bypasses the bundler.
      `npm install echarts` instead and let Vite bundle/tree-shake it.
- [ ] **Resolve the contact form's dependency on `validation.php`.** The form
      posts to a PHP endpoint that doesn't exist anywhere in this repo — an
      invisible external dependency. Either document where that backend
      lives and how it's deployed, or replace with a managed form service.
- [ ] **Fix the hand-rolled email regex** in `validation.js`
      (`/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g`) — rejects valid TLDs longer than
      4 chars, and reuses a `/g` regex object across calls which carries
      `lastIndex` state and can silently mis-validate on repeated use.

## Polish

- [ ] **Add `engines` to `package.json`** matching `.nvmrc` (Node 18.20.8) so
      the two can't drift.
- [ ] **Add accessibility/performance auditing** (Lighthouse CI and/or
      `axe-core`) given the manual aria-attribute work already in the forms —
      worth verifying it actually holds up.

## Look & feel

The dark retro-terminal/sci-fi aesthetic (per-project accent colors via CSS
vars, monospace headings, the "spaceship control panel" decoration on the
contact page, ASCII-pattern chart backgrounds) is distinctive and clearly not
a template — keep it. The gaps below are finishing touches, not a redesign.

- [ ] **Fix the mobile type scale.** `body` is `font-size: 20px` by default
      with no smaller size for narrow phones (<375px), and cover-page `h1` is
      a fixed `60px` regardless of viewport — real risk of overflow/awkward
      wrapping on small screens (`src/styles/main.scss`, `covers.scss`).
- [ ] **Drop `background-attachment: fixed`** from the `cover` mixin
      (`src/styles/mixins.scss`) — known to be janky/inconsistently
      supported on mobile Safari, so the intended parallax effect likely
      doesn't render the same way for most visitors.
- [ ] **Run project images through `astro:assets`.** Spot-checked
      `aeris-cover.jpg` at 252KB served as a plain full-size JPEG with no
      responsive variants, `webp`/`avif`, or lazy loading — same file served
      to mobile and desktop. Astro's `<Image />` component does this for
      free.
- [ ] **Add a loading state for the charts section** so there isn't a blank
      box while the CDN script (see above) loads before content pops in.
- [ ] **Fix `margin: var(--spcaing-0);` typo** in `src/styles/main.scss:53`
      (should be `--spacing-0`) — currently a silently-invalid custom
      property reference.
- [ ] **Remove the dead `fontface` mixin** in `src/styles/mixins.scss` — uses
      old-style Sass string concatenation that's invalid in modern Dart Sass,
      and isn't called anywhere; all real `@font-face` rules are hand-written
      in `typography.scss` instead.

## Suggested order

1. `git init` + push, add CI running `astro check` + build.
2. Collapse the 20 project pages into one dynamic route backed by Content
   Collections.
3. Replace the random chart data with real numbers and move ECharts to a
   real dependency.
4. Mobile type scale + `astro:assets` image pipeline (biggest visible wins
   for the least effort).
