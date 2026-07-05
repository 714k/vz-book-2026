# 1. Record architecture decisions

## Status

Accepted

## Context

This repo went from zero tooling (no lint, no tests, no CI) to a full
quality stack in one push: ESLint/Prettier/Stylelint, git hooks, Vitest,
Playwright, SonarQube, CodeQL/gitleaks, Lighthouse CI, Dependabot. Several
of those steps involved a real tradeoff or a non-obvious constraint (e.g.
why `npm audit` doesn't block deploy, why the CSP allows `'unsafe-inline'`,
why some Stylelint rules got disabled instead of "fixed"). None of that
reasoning lives anywhere if it's only in PR descriptions and commit
messages, which are easy to lose track of once there are dozens of them.

## Decision

Record decisions with real tradeoffs (not just "we added ESLint") as ADRs
under `docs/adr/`, one file per decision, never edited after acceptance -
superseded by a new ADR instead.

## Consequences

- Anyone (including future me) can find _why_ a rule is disabled or a gate
  is non-blocking without archaeology through git history.
- Adds a small amount of overhead per significant decision going forward.
- Only decisions with a real tradeoff get one - not every tool addition
  warrants an ADR (see `IMPROVEMENTS.md` and PR descriptions for the rest).
