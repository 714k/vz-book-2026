# 10. Book page content authored as data

## Status

Accepted (extended by [ADR 0011](0011-roll-out-book-content-template.md),
which rolls the template out to the remaining book sections and resolves the
"only `the-assembly` uses this today" open question below)

## Context

The "book" pages under `no-one-knows/` are long-form editorial writing:
`the-assembly` alone runs to 19 headed sections of prose, lists, diagrams
and captions. It was first built with every one of those texts inline in
`the-assembly.astro` - roughly 290 lines of JSX where the copy and the
markup were interleaved.

That put this page at odds with the rest of the site, where content lives
in `src/content/*.json` behind a Zod schema (see
[`architecture.md#content--build-pipeline`](../architecture.md#content--build-pipeline)).
It also meant editing a sentence required reading JSX, and nothing
validated the copy: a missing caption or an empty section was a silent
rendering bug rather than a build failure.

The existing collections were no template to copy. They pair a `toc` with
one array of records (`courses`, `ammos`, `adventures`) - a shape that fits
a page which is essentially a table, and not one that is essentially a
written book section.

## Decision

Move every text into `src/content/the-assembly.json`, shaped like the page
rather than like the existing collections: `page`, `hero`, `metadata`,
`labels`, then `primaryContent`, `impact`, `relatedWork` and
`closingThought` matching the four `ContentContainer` slots, then `footer`.

The sections turned out to share one skeleton, and a single order covers
all 19 of them: statement, paragraphs, body, closing paragraphs, diagram,
closing statement. Only the body genuinely differs. So:

- `ContentSection` renders that skeleton from a `SectionContent` object,
  and a page part is a list of sections the page maps over. The page went
  from ~290 lines to ~69, half of which are the header comment and the
  `BookPage` props. No section is written by hand.
- A `kind` tag on each body (`focusAreas`, `decisions`, `metrics`,
  `relatedWork`, `list`, `groups`, `topics`) and on each diagram
  (`stages`, `code`, `tree`) picks the component that renders it, as a Zod
  `discriminatedUnion`.
- The slotted primitives stay: `SectionShell` and `DiagramFigure` are for
  sections that need one-off markup.

The rendered HTML was held byte-for-byte identical to the hand-written
version throughout the move, by diffing the built page against a baseline
at each step. The only intentional deviation came later, renaming the
figure class `diagram-figure` to `content-diagram`.

## Consequences

- **`kind` puts presentation into the content files.** This is the real
  cost. A content file now names, indirectly, the component that renders
  it - which the other collections never do. It is what buys the `.map()`;
  without it `items` of strings and `items` of `{title, description}` are
  indistinguishable, and the page is back to naming each section. Contained
  to one field per body, but it is a line crossed.
- Adding, reordering or rewording a section is a JSON edit, and a
  malformed one now fails `astro build` like any other collection.
- A section that needs a different order, or markup no `kind` covers, must
  use `SectionShell` directly. Growing `ContentSection` a flag to cover it
  would trade the skeleton's one clear contract for a pile of special
  cases - the thing the abstraction exists to avoid.
- `book-content/examples/ExampleContent.astro` keeps the hand-written
  structure as documentation. It is now a second thing to update when the
  template changes, and nothing enforces that it stays in sync.
- Only `the-assembly` uses this today. The remaining book pages
  (`the-fixer`, `the-navigator`, `the-server`) still use the older
  `toc` + records shape; whether they migrate is an open question, and
  they are table-shaped enough that the answer may be no.
- `CodeSnippet` exists to hold one line of markup, because `<pre>`
  preserves whitespace and Prettier insists on breaking the tags across
  lines - which lands the indentation in the rendered output. The
  `prettier-ignore` lives in that one file instead of at every call site.
