---
name: pattern-preview
description: Make the previews a Magma pattern of this repository lacks (docs/agents/patterns/previews/<id>/<case>.html, #1186) - for each case with none, two options rendered with the real components, shown to the maintainer as a decision, the chosen one saved as the preview of the case. Use when a maintainer asks for the previews of a pattern, when check.patterns lists cases with no preview, and at the end of pattern-new and pattern-change.
argument-hint: <id> [case]
---

# The previews of a pattern

The pattern, and the case if one is named: $ARGUMENTS. The format of a preview is in
`docs/PATTERNS.md`, "The preview of a case": read it first.

## 1. What is missing

Run `npx nx run stencil:check.patterns` (it needs the build: `npx nx run stencil:build` when
`projects/stencil/dist/documentation.json` is missing). Its warning lists the cases with no
preview. Without an id, show that list by pattern and ask which one; with an id and no case, take
its cases with no preview in their order; with a case, that case, even when it has one (a new
preview replaces it).

Work on a branch of its own, off `main` (`docs/WORKFLOW.md`), never on `main`.

## 2. Two options for a case

Read the case in `docs/agents/patterns/<id>.md`: its values, `where`, `use` and `see`, and the
rules of "Always true" it must not break. Read the usage files of the components it names
(`projects/stencil/src/components/<tag>/usage/`). Then write two stages, each a preview in the
format, in a scratch folder (never in `docs/` before the choice):

- both do what the case says, with the components and attributes of its `use`;
- they differ on something the case leaves open (where exactly, the words, what sets it off),
  never on a rule of the pattern;
- each opens with its `try`: what to do in it ("Press Salva: ..."), or what to look at when
  there is nothing to do;
- an overlay gets a `height`, and a banner that is the message of a modal goes in its `window`
  slot;
- the words are Italian, short, of an ordinary application (a form, a list, a record).

Choose the one to recommend, with a reason in one line.

## 3. The decision

Show the two options as the client allows, the recommended one first:

- **With an inline widget** (the Claude desktop app): the decision of #1182. Two options per row,
  never more. Each card, in the client's colours and font: on top the stage, which is a page of
  its own (an `<iframe>` whose `srcdoc` is the stage under a head with the stylesheets of
  `agents/assets.md`, "Import order (mandatory)", and the loader of magma, from
  `cdn.jsdelivr.net` at the versions of `projects/styles/package.json` and
  `projects/stencil/package.json`); the recommended stage with the accent border; under it the
  `try` line; then the "Consigliata" badge, on the recommended one only; then the numbered
  description; then "Qualcosa non va" (left) and "Scelgo N" (right), which send the answer back.
  Under the cards the free answer, with "Prova". The top right of the widget stays empty: the
  client draws its menu there. The CDN serves the published release: say so when the branch
  changed a component the preview uses.
- **With `render_preview`** of the Magma MCP server: one image per option, attached where the
  client does not show it.
- **Otherwise as text**: the options in order, the recommended first, each with its `try` line,
  and the free answer.

Then:

- **"Scelgo N"**: save that stage as `docs/agents/patterns/previews/<id>/<case>.html`;
- **"Qualcosa non va"**: find what does not show (hydration, an overlay with no `height`, a
  wrong attribute), fix it and show the decision again;
- **"Prova: ..."**: write what the maintainer described as a new option and show it next to the
  others; save nothing until a choice.

The maintainer may answer for several cases at once ("the recommended one for all"): then save
the recommended stage of each.

## 4. The check

```bash
npx nx run stencil:check.patterns
```

until no preview is wrong. Then the next case, from step 2.

## 5. The pull request

Run `npx nx run stencil:check.usage-docs` and `npx nx run lint:test` too, commit
(`feat(magma): the previews of the cases of <id>`; ASCII only, `docs/COMMITS.md`), check
`origin/main` in its own step and merge it if it moved, push the branch and open a pull request
into `main` with the choices taken. Never merge it. Called from `pattern-new` or
`pattern-change`, the previews go in their pull request instead.
