# 11. Roll out the book-content template to the remaining book pages

## Status

Accepted (extends [ADR 0010](0010-book-page-content-as-data.md))

## Context

[ADR 0010](0010-book-page-content-as-data.md) introduced the data-driven
book-content template and applied it to `the-assembly` alone. It left an
open question: the other book pages (`the-fixer`, `the-navigator`,
`the-server`) still used the older `toc` + records shape, and were "table-
shaped enough that the answer may be no" on whether they should migrate.

The portfolio then grew in the written direction. `the-server` was rewritten
as an engineering-identity section and `the-navigator` as a career-progression
narrative, and four new book sections were added: `the-map` (Product
Architecture), `the-pattern` (Design Systems), `the-signal` (AI Integration),
and `the-integrator` (Technical Integration). All are prose-and-diagram
sections of the book - exactly the shape the template exists for.

## Decision

Use the book-content template (`ContentContainer` + `ContentSection`, all
copy in `src/content/<page>.json` behind `bookContentPageSchema`) for every
section of the book:

- `the-assembly`, `the-server`, `the-navigator`, `the-fixer`, `the-map`,
  `the-pattern`, `the-signal`, `the-integrator`. They are wired into the
  book's prev/next navigation and cross-link through their `relatedWork`
  cards.
- `the-server`, `the-navigator` and `the-fixer` also carry a `coverline` (the
  blurb the two index covers read), so they use
  `bookContentPageSchema.extend({ coverline })`; the rest use
  `bookContentPageSchema` unchanged.
- `the-navigator` was migrated off the `adventures` shape. Its
  `Adventures.astro` renderer is now orphaned - kept, not deleted.

### Amendment: `the-fixer` migrated too

This ADR originally kept `the-fixer` on the `toc` + `ammos` records shape as
the deliberate lone holdout: it was a genuine data matrix (five skills /
"ammunition" tables, 123 rows of name, years, usage, level and percentage),
not written copy - exactly the case ADR 0010 said should not migrate.

That reasoning held for the page as it was, and stopped holding when the page
was rewritten. `the-fixer` was re-authored as a written section about applied
judgment (hard skills, soft skills, and the two in combination), which is the
shape this template exists for. Self-rated percentages per tool were also
weaker evidence of Staff-level capability than the prose that replaced them.

So `the-fixer` now uses the template like every other book page, and the
`ammos` matrix is dropped rather than carried over: no section of the new
copy refers to it, and keeping it would have meant a page that argues
judgment matters more than tool inventory while leading with a tool
inventory. The content is recoverable from git history.

Two small extensions to the template were needed to keep real copy
declarative, both following the existing discriminated-union pattern and
staying contained to one component each:

- A `table` body `kind` (`{ columns, rows }`), rendered by `SectionBody` in
  a horizontally-scrollable wrapper. Added for `the-navigator`'s "The Route"
  career table.
- An optional `items` array on `metadata` (term/value pairs), for pages
  whose metadata does not fit the fixed Role / Focus / Experience / Scope /
  Impact labels - e.g. `the-server`'s "Based in", "At Thomson Reuters since",
  "Building for the web since". When present it replaces the fixed fields;
  otherwise the fixed fields still render, so the other pages are unaffected.

## Consequences

- The open question in ADR 0010 is resolved: the template is the default for
  book sections, and with `the-fixer` migrated it is now the shape of every
  book page. The `toc` + records shape survives only outside the book
  (projects, the index pages, `the-evolution`).
- `Ammos.astro`, `ammoRecordSchema` and the 123 rows of skills data are gone
  from the running site. `Ammos.astro` is left in place, orphaned, on the
  same reasoning as `Adventures.astro`.
- Adding another book section is now a small, componentless change: one JSON
  file, a ~60-line `.astro` wrapper, one collection registration in
  `content.config.ts`, and wiring into the prev/next chain and the main
  navigation.
- The two extensions each add one more branch to keep the copy out of
  markup. They are the same trade ADR 0010 already made - a little more
  presentation vocabulary in the content layer in exchange for pages that
  stay pure data.
- `Adventures.astro` is dead code until removed. It is left in place because
  the adventures content it rendered still lives in git history and could be
  revived.
- `book-content/examples/ExampleContent.astro` remains the hand-written
  reference, and the second thing to keep in sync when the template changes,
  as noted in ADR 0010.
