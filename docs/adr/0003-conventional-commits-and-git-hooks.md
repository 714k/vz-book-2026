# 3. Conventional Commits and git hooks

## Status

Accepted

## Context

With no CI and no hooks, nothing stopped a broken commit from landing on
`main`. Needed local, fast feedback before code even reaches CI, without
making every commit slow or blocking on things that aren't ready yet (e.g.
`astro check` initially failed on 27 pre-existing errors before those got
fixed - a `pre-push` hook running it would have blocked every push in the
repo until that cleanup happened).

## Decision

Husky hooks, each scoped to what's fast and safe to run locally:

- `pre-commit`: `lint-staged` (ESLint/Prettier/Stylelint `--fix` on staged
  files only, not the whole repo) plus `gitleaks protect --staged` if
  gitleaks is installed locally (skips with a warning otherwise - CI runs
  it unconditionally either way, see ADR 7).
- `commit-msg`: `commitlint` against `@commitlint/config-conventional`.
- `pre-push`: `npm run typecheck` only - not the full test suite, so a
  push isn't blocked on slow e2e runs. Deliberately _not_ including
  `test:unit` here either: the first attempt at wiring it in was rejected
  during review to keep pre-push fast, and CI's `quality.yml` already runs
  the full test suite before anything merges.
- `post-merge`: reinstalls dependencies automatically if
  `package-lock.json` changed in the merge - the "why is my build broken,
  oh I forgot to `npm install`" problem.

## Consequences

- Commit messages are `<type>: <description>` from here on; anything not
  matching a conventional-commit type is rejected at commit time, not in
  a PR review three days later.
- Fast local feedback loop; the tradeoff is that `pre-push` alone can't
  catch everything `quality.yml` catches (e2e, coverage thresholds) - CI
  is still the actual gate, hooks are just an early warning.
- gitleaks not being installed locally silently degrades to "CI will
  catch it" rather than blocking the commit - a deliberate choice so
  contributors without gitleaks installed aren't stuck, at the cost of a
  secret potentially reaching a local commit (not a push, still caught by
  CI) before anyone notices.
