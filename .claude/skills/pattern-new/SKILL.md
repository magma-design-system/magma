---
name: pattern-new
description: Define a new Magma pattern (or turn a candidate into one) in this repository, the way the patterns of Messages and states were defined on #1174. The maintainer gives the need in one sentence and answers the few decisions the sources do not settle; the skill checks the list first, researches, writes docs/agents/patterns/<id>.md, runs the check and opens the pull request. Use when a maintainer asks for a new pattern or building block.
argument-hint: <the need, in one sentence>
---

# A new pattern

The need, as the maintainer gave it: $ARGUMENTS. If it is empty, ask for it in one sentence,
with no component in it ("the person must know a save failed"), and nothing else.

The format, the method and the commands are in `docs/PATTERNS.md`: read it first. The five
patterns of Messages and states (`docs/agents/patterns/`) are the examples to follow.

## 1. Check the list first

Run `npx nx run stencil:list.patterns` and search the patterns for the need (`grep -il` on
their `need`, `keywords` and `situations` in `docs/agents/patterns/`):

- a defined pattern covers it: say which one, and propose `/pattern-change <id>` instead;
- a candidate covers it: this skill turns that candidate into the pattern, keeping its id;
- nothing covers it: choose a new id, kebab-case, named after the task, not a component.

Then ask, as a multiple choice, whether it is a pattern (a flow of components over time) or a
building block (a structure of the page). Building blocks are not written yet: they come from
the patterns of the Data group (#1083), so for a block stop here and say so.

## 2. The draft

Work on a branch of its own, off `main` (`docs/WORKFLOW.md`), never on `main`. Then:

```bash
npx nx run stencil:generate.pattern <id> --group <group> --need "<the need>"
```

## 3. Research, then write

Read the sources before asking anything: the docs site (`agents/patterns.md` and
`plan/DIRECTION.md` of magma-design-system/docs, with `gh api`), the usage files of the
components involved (`projects/stencil/src/components/<tag>/usage/`), their API
(`projects/stencil/dist/documentation.json`, or the readme), the patterns it touches (their
`not-for` and `related`), the high-stakes rule of epic #1083. Then fill in the template, every
field a question that defines a pattern:

- **the variables**: the few questions about the situation that decide the case, never a
  domain (no municipality, no product); each with its values and what it means;
- **the cases**: values of the variables; `use` names the components as `mds-tag attribute=value`;
- **the situations**: actions every application has (save a form in a dialog, delete from a list,
  copy a link, export a big file, lose the connection), each with its case;
- **what is always true**, each rule `checked-by: review` or `lint` (with `lint-planned` for a
  rule to write), and the **open choices** a product may narrow;
- the parts, the behaviour over time, accessibility, content, and the **Magma gaps** found.

Write the source of every choice the sources settle as a row of `## Decisions` (date, decision,
why, the source in the why).

## 4. The check, until it is green

```bash
npx nx run stencil:generate.pattern -- --sync
npx nx run stencil:check.patterns
```

The check needs the build (`npx nx run stencil:build` when `dist/documentation.json` is missing).
Every combination of the variables with no answer becomes a case, a gap (`note`: the question)
or a not-applicable entry (`why`); two cases on one combination are a conflict to resolve.

## 5. The decisions the sources do not settle

Ask the maintainer, two or three at a time, each a multiple-choice question with the
recommended option first and a one-line reason for each option. Every answer becomes a row of
`## Decisions`. When no gap is left, set `status: decided`.

## 6. The previews

For each case, its preview: follow `.claude/skills/pattern-preview/SKILL.md` for this pattern
(two options live, the maintainer chooses), so the pattern leaves with every case shown.

## 7. The pull request

Run `npx nx run stencil:check.usage-docs` and `npx nx run lint:test` too, commit
(`feat(magma): add the pattern <id>`; ASCII only, `docs/COMMITS.md`), check `origin/main` in its
own step and merge it if it moved, push the branch and open a pull request into `main` with the
decisions taken. Never merge it. Report the Magma gaps found, one proposed issue each.
