<!--
  Keep this PR easy to scan. The commit table below is the important part:
  it lets a reviewer understand the size and impact of each change at a glance.
  Governance rules: see docs/WORKFLOW.md - do NOT merge into dev or main yourself.
-->

## Summary

<!-- One or two sentences: what does this PR do and why. -->

Closes #

## Commits overview

<!--
  One row per meaningful commit (squash trivial ones).
  Impact = the semver weight of that change on its own:
    patch = fix / no API change | minor = new backward-compatible feature | major = breaking change
-->

| Commit type | Scope | What it changes | Impact |
| ----------- | ------------- | --------------------------- | ------------------- |
| feat        | mds-button    | add `tone` prop             | minor               |
| fix         | mds-modal     | correct backdrop click-through | patch            |
|             |               |                             |                     |

## Overall impact

- [ ] **patch** - bug fixes only, no API change
- [ ] **minor** - new backward-compatible functionality
- [ ] **major** - breaking change (call it out explicitly below)

## Affected packages

- [ ] `@maggioli-design-system/magma` (stencil components)
- [ ] `@maggioli-design-system/styles`
- [ ] `@maggioli-design-system/design-tokens`
- [ ] `@maggioli-design-system/icons`
- [ ] `@maggioli-design-system/svg-icons`
- [ ] `@maggioli-design-system/identity`
- [ ] Documentation / Storybook

## Breaking changes

<!-- If none, write "None". Otherwise describe the break and the migration path. -->

None

## How to test

<!-- Steps a reviewer can follow to verify the change. -->

## Checklist

- [ ] Work is on a dedicated branch, not directly on `dev` or `main`
- [ ] Branch is up to date with `dev` (merged latest `dev` in)
- [ ] Tests pass locally (`nx run stencil:test`) and affected builds succeed
- [ ] Commit messages follow `docs/COMMITS.md`
- [ ] Updated the relevant `SPEC.md` (and `docs/ARCHITECTURE.md` if system-wide)
- [ ] I am **not** merging this into `dev` or `main` myself - that is a manual governance step
