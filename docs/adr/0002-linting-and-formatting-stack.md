# 2. Linting and formatting stack

## Status

Accepted

## Context

The project had no ESLint, Prettier, or Stylelint config at all - every
existing violation was a first-run discovery, not a regression. Running
the tools cold surfaced ~34 ESLint errors, ~1500 Stylelint errors (mostly
autofixable whitespace), and 27 `astro check` type errors across a
codebase that had never seen any of these tools.

Two categories of finding needed different treatment:

1. **Real bugs**: a duplicate `tooltip` key silently discarding
   `trigger: 'item'` in a pie chart config, a `margin: var(--spcaing-0)`
   typo (already flagged in `IMPROVEMENTS.md`) that invalidated the whole
   declaration, an `&::afters` pseudo-element typo that made a rule dead,
   `getEntry()` calls that TypeScript correctly flags as possibly
   `undefined`, several hand-written prop interfaces (`TOC`, `ProjectBrief`,
   `Adventures`, `Ammos`) that had drifted from the Zod schemas backing
   them.
2. **Stylistic-only findings with real fix risk**: this codebase's
   established convention is camelCase for SCSS mixins/variables (not
   kebab-case), and several flagged IDs (`#tableOfContent`, `#menuToggle`,
   `#allCoursesChart`) are read directly by `document.getElementById` in
   `src/scripts/charts.js` and page `<script>` blocks - renaming them for
   a purely stylistic lint rule means coordinated CSS+JS changes with real
   regression risk, for zero functional benefit.

## Decision

- ESLint: flat config, `typescript-eslint` strict preset +
  `eslint-plugin-astro` recommended rules, `eslint-config-prettier` to
  defer all formatting to Prettier.
- Prettier: default style, `prettier-plugin-astro` for `.astro` files.
  One file (`src/layouts/Default.astro`) is excluded - its inline
  `<script type="application/ld+json">{JSON.stringify(...)}</script>`
  hits a parser bug in `prettier-plugin-astro`.
- Stylelint: `stylelint-config-standard-scss`, with
  `selector-id-pattern`, `selector-class-pattern`, `scss/at-mixin-pattern`,
  `scss/dollar-variable-pattern`, `keyframes-name-pattern`,
  `property-no-deprecated`, and
  `declaration-property-value-keyword-no-deprecated` disabled (see
  `.stylelintrc.json` and the `fix: resolve real Stylelint findings...`
  commit for the full reasoning per rule).
- Fixed every _real_ finding (category 1) rather than suppressing it;
  disabled only the rules in category 2, and only after confirming via
  grep that the "violating" identifiers are load-bearing elsewhere.

## Consequences

- `npm run lint`, `format:check`, `stylelint`, and `typecheck` are all
  green and mean something - a regression will actually fail them.
- The disabled Stylelint rules mean this codebase's camelCase SCSS
  naming and its DOM-coupled IDs are permanently exempt from those
  specific style rules; a future rewrite of `charts.js` to not need
  `getElementById` could re-enable `selector-id-pattern` deliberately.
- `Default.astro` never gets Prettier-formatted until someone either
  works around the plugin bug or upstream fixes it.
