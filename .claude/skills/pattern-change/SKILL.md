---
name: pattern-change
description: Change a Magma pattern of this repository (docs/agents/patterns/<id>.md) - a case, a rule, an open choice, its id - showing first why the current answer was decided, and asking whether the change is the default for every product or a choice of one product's layer. Use when a maintainer asks to change, fix, rename or extend a pattern.
argument-hint: <id> [what to change]
---

# Change a pattern

The pattern and the change, as the maintainer gave them: $ARGUMENTS. Without an id, run
`npx nx run stencil:list.patterns` and ask which one. The format and the commands are in
`docs/PATTERNS.md`.

## 1. Why it is so

Read `docs/agents/patterns/<id>.md`. Before changing anything, show the maintainer the rows of
`## Decisions` behind the part to change (the date, the decision, the why), and the cases, rules
or choices of other patterns that cite it (`grep -n "<id>" docs/agents/patterns/*.md`).

## 2. For every product, or for one

Ask, as a multiple choice:

- **the default, for every product** (recommended when the reason holds everywhere): the change
  goes in this file;
- **a choice of one product**: it goes in the layer of that product, in its own repository
  (`magma/patterns/<id>.md`, with `extends: magma:<id>`); a layer narrows the open choices and
  adds situations of its domain, nothing else. Write it only if the maintainer points to that
  repository; check it with `npx nx run stencil:check.patterns -- --layer <its folder>`.

A change to an "Always true" rule is never a product's: say that it holds in every product, that
`pr-risk` raises the review level of the pull request to contract, and ask for an explicit yes.

## 3. The change

- On a branch of its own, off `main` (`docs/WORKFLOW.md`).
- **A rename**: the new id, the old one kept in `aliases` (an id is a contract the agents of the
  products cite); every reference updated, since the check fails on an old id.
- **A removed case, rule or open choice**: say which product layers or patterns cite it; `pr-risk`
  reports it.
- Edit the frontmatter, never the generated sections (Cases, Always true, Open choices,
  Situations): `npx nx run stencil:generate.pattern -- --sync` writes them.
- A decision the sources do not settle: a multiple-choice question, recommended option first.
- Add a row to `## Decisions`: the date, the decision, why.

## 4. The check and the pull request

```bash
npx nx run stencil:check.patterns
npx nx run stencil:check.usage-docs
npx nx run stencil:check.pr-risk
```

Then commit (`feat(magma): ...` for a new rule or case, `fix(magma): ...` for a wrong one;
ASCII only), check `origin/main` in its own step and merge it if it moved, push the branch and
open a pull request into `main` with the decisions. Never merge it.
