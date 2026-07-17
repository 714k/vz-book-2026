# Architecture

A static Astro site: content authors edit JSON + `.astro` files, CI
validates and tests every change, and only a passing build ever reaches
production. This doc is the visual companion to
[`docs/adr/`](adr/README.md) - diagrams here show _how the pieces fit_;
the ADRs explain _why_ each piece is shaped the way it is.

## System context

Who/what talks to this system, end to end - from a content edit to a
visitor's browser.

```mermaid
flowchart LR
    Author([Content author]) -->|edits JSON / .astro / .scss| Repo[(GitHub repo)]

    Repo -->|opens PR| Quality["quality.yml<br/>lint · typecheck · test · e2e · audit"]
    Quality -->|status checks| Repo

    Repo -->|push to main| Deploy[deploy.yml]
    Deploy -->|needs: quality| Quality
    Deploy -->|FTP| Host[HostGator / Apache]
    Host -->|static HTML/CSS/JS + CSP headers| Visitor([Visitor's browser])

    Repo -.->|scheduled + on push/PR| CodeQL[CodeQL]
    Repo -.->|on push/PR| Gitleaks[gitleaks]
    Repo -.->|manual, local or self-hosted| Sonar[(SonarQube)]
    Repo -.->|weekly| Dependabot[Dependabot]
```

Everything to the right of "opens PR" is automated; nothing reaches
`Host` without `Quality` passing first (see
[ADR 0005](adr/0005-ci-quality-gate-blocks-deploy.md)).

## Content → build pipeline

There's no CMS and no server at runtime - every page is fully static,
generated at build time from JSON validated against Zod schemas.

```mermaid
flowchart TD
    JSON["src/content/**/*.json<br/>(one file per page/project)"] --> Schema
    Schema["Zod schemas<br/>src/content.config.ts"] -->|validated at build time| Collections["Astro Content Collections<br/>getCollection() / getEntry()"]

    Collections --> Pages["src/pages/**/*.astro"]
    Components["src/components/*.astro"] --> Pages
    Styles["src/styles/*.scss"] --> Pages
    Scripts["src/scripts/*.js<br/>(validation.js, charts.js)"] -->|imported in frontmatter| Pages

    Pages -->|astro build| Dist["dist/<br/>static HTML + CSS + JS"]
```

A malformed content JSON fails the _build_, not just a test - Zod
validation runs as part of `astro build`/`astro check` itself, and the
integration tests in `test/integration/` additionally assert the schema
against every real file so a break is caught in CI before it ever reaches
`astro build` in production.

## Book page content

Most pages hand-write their markup and pull only data (a project brief)
from JSON. The "book" pages under `no-one-knows/` are the exception: _all_
of their copy - every paragraph, heading, list, caption - lives in the
page's JSON file, and the `.astro` page only arranges it.
[ADR 0010](adr/0010-book-page-content-as-data.md) covers why, and what it
costs; [ADR 0011](adr/0011-roll-out-book-content-template.md) covers the
rollout.

All eight book sections now use this template - `the-assembly`,
`the-server`, `the-navigator`, `the-fixer`, `the-map`, `the-pattern`,
`the-signal`, and `the-integrator` (`the-server`, `the-navigator` and
`the-fixer` also carry a `coverline` for the index covers).

Every section of such a page shares one skeleton - statement, paragraphs,
body, closing paragraphs, diagram, closing statement - and only the _body_
differs between them. So a page part is a list of sections that the page
maps over, and a `kind` tag on each body picks the component that renders
it.

```mermaid
flowchart TD
    JSON["src/content/&lt;page&gt;.json<br/>hero · metadata · sections · footer"] --> Page["&lt;page&gt;.astro<br/>{primaryContent.map(...)}"]

    Page --> Container["ContentContainer<br/>owns the page anatomy:<br/>hero · metadata · core · impact<br/>related work · closing thought"]
    Page --> Section["ContentSection<br/>one section, from data"]

    Section --> Shell["SectionShell<br/>&lt;section&gt; + heading + slot"]
    Section --> Body["SectionBody<br/>dispatches on body.kind"]
    Section --> Diagram["ContentDiagram<br/>dispatches on diagram.kind"]

    Body --> B1["focusAreas → PrimaryContent<br/>decisions → DecisionList<br/>metrics → ImpactList<br/>relatedWork → RelatedWork<br/>list · groups · topics · table → plain markup"]
    Diagram --> D1["stages → ordered pipeline<br/>code → CodeSnippet<br/>tree → CompositionTree"]
```

The two "shell" components (`SectionShell`, `DiagramFigure`) are slotted
primitives: reach for them directly when a section needs one-off markup,
rather than adding a flag to `ContentSection`. `book-content/examples/`
keeps a hand-written version of the same page as reference.

Two body/metadata shapes were added as the template rolled out (see
[ADR 0011](adr/0011-roll-out-book-content-template.md)): a `table` body
`kind` (`{ columns, rows }`) for tabular sections like `the-navigator`'s
career route, and an optional `items` array on `metadata` (term/value
pairs) for pages whose labels do not fit the fixed Role / Focus /
Experience / Scope / Impact set, such as `the-server`.

## Test strategy

Three layers, each catching a different class of regression - see
[ADR 0004](adr/0004-testing-strategy.md) for what's deliberately _not_
covered yet (font 404s, per-project color contrast).

```mermaid
flowchart TD
    subgraph E2E["e2e - Playwright (test/e2e/)"]
        E2E1["Every generated page: HTTP 200, page title,<br/>zero console/page errors, axe a11y (critical)"]
    end
    subgraph Integration["integration - Vitest (test/integration/)"]
        I1["Real astro:content: every project JSON<br/>validated against its Zod schema"]
    end
    subgraph Unit["unit - Vitest + jsdom (test/unit/)"]
        U1["Pure functions from validation.js and<br/>charts.js: email regex, chart data shaping"]
    end
    Unit --> Integration --> E2E
```

## Quality gates over time

The same change passes through progressively more expensive checks -
cheap and local first, expensive and authoritative last. See
[`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full sequence diagram of
what runs at each git hook.

```mermaid
flowchart LR
    A["pre-commit<br/>lint-staged + gitleaks"] --> B["commit-msg<br/>commitlint"]
    B --> C["pre-push<br/>astro check"]
    C --> D["PR: quality.yml<br/>lint · format · stylelint<br/>typecheck · test · e2e · audit"]
    D --> E["merge to main"]
    E --> F["deploy.yml<br/>re-runs quality.yml as a gate"]
    F --> G["FTP deploy to HostGator"]
```

## Directory map

| Path                                           | What lives here                                                         | Owned by / validated by                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/pages/`                                   | Routes - thin, mostly just wire Content Collection data into components | `astro check`, e2e smoke                                |
| `src/layouts/`                                 | `BookPage.astro` - shared `<head>`, `Header`, `Footer`, prev/next nav   | e2e smoke (every page uses it)                          |
| `src/components/`                              | One component per page section                                          | ESLint (incl. jsx-a11y), unit tests where logic-bearing |
| `src/components/book-content/`                 | The book-page content template - see [below](#book-page-content)        | ESLint (incl. jsx-a11y), e2e smoke + axe                |
| `src/content/`                                 | JSON content, one file per project/page                                 | Zod schemas in `content.config.ts`, integration tests   |
| `src/styles/`                                  | One SCSS partial per page/section                                       | Stylelint                                               |
| `src/scripts/`                                 | Plain JS (not framework components) - form validation, charts           | Vitest unit tests                                       |
| `src/lib/`                                     | Small shared TS helpers (`content.ts`)                                  | `astro check`                                           |
| `public/`                                      | Static passthrough - images, fonts, `.htaccess`, `robots.txt`           | -                                                       |
| `test/unit/`, `test/integration/`, `test/e2e/` | See [Test strategy](#test-strategy) above                               | -                                                       |
| `docs/adr/`                                    | Why decisions were made                                                 | -                                                       |
| `.github/workflows/`                           | `quality.yml`, `deploy.yml`, `codeql.yml`, `gitleaks.yml`               | -                                                       |

## What this is _not_

Worth stating explicitly, since the diagrams above could otherwise imply
more than exists:

- No server-side runtime - `astro build` outputs pure static files, FTP'd
  to a shared Apache host. No API, no database, no SSR.
- No CDN in front of the site itself (only third-party assets - ECharts,
  Google Fonts - are CDN-loaded, see
  [ADR 0007](adr/0007-security-scanning-and-headers.md)).
- No feature flags, no A/B testing, no analytics wired up yet (the
  previous placeholder script was removed - see the
  `fix: remove broken analytics script placeholder` commit).
