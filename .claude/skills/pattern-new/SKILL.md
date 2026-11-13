---
name: pattern-new
description: Define a new Magma pattern (or turn a candidate into one) in this repository, the way the patterns of Messages and states were defined on #1174. The maintainer gives the need in one sentence and answers the few decisions the sources do not settle; the skill checks the list first, checks the components that hold the role (use as they are, change, a new one, or one way only), researches, writes docs/agents/patterns/<id>.md, runs the check and opens the pull request. Use when a maintainer asks for a new pattern or building block.
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

Then ask, as a multiple choice, whether it is a pattern (a flow of components over time), a
building block (a section of the page that comes back in the same arrangement; `docs/PATTERNS.md`,
"A building block") or a domain of the design language (a rule of composition the patterns stand on: a
space, a weight, a style, a surface, a width; `docs/PATTERNS.md`, "A domain of the design language"). A
block is never designed in advance: it needs two defined patterns that lay out the same section
(its `used-by`); with fewer, write the section inside the pattern and say so.

## 2. The components that hold the role

A pattern or a block stands on components: written over one that does the job badly, it would
carry its flaws into every product. Before the draft, for the role the need asks (a field, a
target to drop files on, a bar of actions, a list of items):

1. **Find them.** The catalogue (`docs/COMPONENTS.md`: the categories, the "Native analogue"
   column) and `find_component` of the MCP server with the need in words; then the usage files
   (`projects/stencil/src/components/<tag>/usage/`) and the API of each. List every component
   meant for the role, and every pattern or block that already composes it.
2. **Check their behaviour** on the real component, rendered (a probe on the build,
   `render_preview`, the stories), in the context of the pattern (inside a card, a row, a
   dialog): does it do what the need asks? Does it hold to today's standards: the design
   language (`actions`, `rhythm`, `surfaces`, ...), the color roles, the words of the guides,
   accessibility (keyboard, dragging movements, names that say what they act on), the rules of
   `projects/stencil/SPEC.md`? Write down each gap with what shows it.
3. **Decide what the pattern stands on**, each choice a row of `## Decisions` with its why:
   - **as it is**: the cases name it in `use`;
   - **changed**: it holds the role, but not as today's standards ask or not in this
     context; the change is an issue on the component, which the pattern waits on or carries,
     and the cases name the component as it will be;
   - **a new component**: only when none holds the role, or holding it would bend the one
     that exists out of its shape;
   - **one way only**: when an existing, simpler way already meets the need, the pattern
     points to it and adds none; two components or two patterns doing the same thing are a
     defect to remove, not a choice to offer.
4. **What it makes redundant.** A pattern, a block or a component the new one replaces is
   deprecated in its favour (the old id in `aliases` of the pattern that takes its place; on a
   component, `@deprecated` naming the replacement, removed in the next major) or overwritten
   (`/pattern-change`, with a row of `## Decisions` that says what it replaces).

Show the maintainer the decision of point 3 rendered: the component as it is and the proposal,
side by side, the recommended one first. The draft names the components the decision chose.

## 3. The draft

Work on a branch of its own, off `main` (`docs/WORKFLOW.md`), never on `main`. Then:

```bash
npx nx run stencil:generate.pattern <id> --group <group> --need "<the need>"
npx nx run stencil:generate.pattern <id> --kind block --group <group> --need "<the need>"  # a block
npx nx run stencil:generate.pattern <id> --kind design-language --need "<what it settles>"  # a domain
```

## 4. Research, then write

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
- for a domain, on each case and rule: **`serves`**, the principle it serves, and
  **`carried-by`**, what carries it (a component default first, then a token or a utility, then
  a lint rule), with `carried-by-planned` for a carrier not built yet and today's value in the
  case;
- the parts, the behaviour over time, accessibility, content, and the **Magma gaps** found.

Write the source of every choice the sources settle as a row of `## Decisions` (date, decision,
why, the source in the why).

## 5. The check, until it is green

```bash
npx nx run stencil:generate.pattern -- --sync
npx nx run stencil:check.patterns
```

The check needs the build (`npx nx run stencil:build` when `dist/documentation.json` is missing,
and again after a preview is added or changed: the build makes its images, #1243).
Every combination of the variables with no answer becomes a case, a gap (`note`: the question)
or a not-applicable entry (`why`); two cases on one combination are a conflict to resolve.

## 6. The decisions the sources do not settle

Ask the maintainer, two or three at a time, each a multiple-choice question with the
recommended option first and a one-line reason for each option. Every answer becomes a row of
`## Decisions`. When no gap is left, set `status: decided`.

## 7. The previews

For each case, its preview: follow `.claude/skills/pattern-preview/SKILL.md` for this pattern
(two options live, the maintainer chooses), so the pattern leaves with every case shown.

## 8. The pull request

Run `npx nx run stencil:check.usage-docs`, `npx nx run lint:test` and `npx nx run mcp:test` too, commit
(`feat(magma): add the pattern <id>`; ASCII only, `docs/COMMITS.md`), check `origin/main` in its
own step and merge it if it moved, push the branch and open a pull request into `main` with the
decisions taken. Never merge it on your own initiative. Report the Magma gaps found, one proposed issue each.
