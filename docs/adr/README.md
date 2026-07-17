# Architecture Decision Records

Short records of decisions with a real tradeoff - what was decided, why,
and what it costs. Most came out of building the code quality strategy
(linting, testing, CI, SonarQube, security, performance, accessibility);
the rest are architecture decisions about the site itself.

Format: lightweight [MADR](https://adr.github.io/madr/)-style - Status,
Context, Decision, Consequences. New ADRs are numbered sequentially and are
not edited after acceptance; if a decision changes, write a new ADR that
supersedes the old one and update the old one's Status line.

| #                                                    | Title                                 | Status   |
| ---------------------------------------------------- | ------------------------------------- | -------- |
| [0001](0001-record-architecture-decisions.md)        | Record architecture decisions         | Accepted |
| [0002](0002-linting-and-formatting-stack.md)         | Linting and formatting stack          | Accepted |
| [0003](0003-conventional-commits-and-git-hooks.md)   | Conventional Commits and git hooks    | Accepted |
| [0004](0004-testing-strategy.md)                     | Testing strategy                      | Accepted |
| [0005](0005-ci-quality-gate-blocks-deploy.md)        | CI quality gate blocks deploy         | Accepted |
| [0006](0006-self-hosted-sonarqube.md)                | Self-hosted SonarQube over SonarCloud | Accepted |
| [0007](0007-security-scanning-and-headers.md)        | Security scanning and headers         | Accepted |
| [0008](0008-accessibility-tooling-and-thresholds.md) | Accessibility tooling and thresholds  | Accepted |
| [0009](0009-performance-budgets.md)                  | Performance budgets                   | Accepted |
| [0010](0010-book-page-content-as-data.md)            | Book page content authored as data    | Accepted |
| [0011](0011-roll-out-book-content-template.md)       | Roll out the book-content template    | Accepted |
