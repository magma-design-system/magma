---
name: component-new
description: Build a new Magma web component in this repository from the proposal a pattern made (its issue, its API, its data-prototype) - scaffold, design decisions as knobs on :host, States story, tests, usage docs, the component in place of its prototype, v2:design-audit before the pull request. Use when a maintainer asks to build or add a component, or a pattern decided on a new one.
argument-hint: <the issue of the proposal, or the tag of the component>
---

# A new component

The proposal: $ARGUMENTS. If it is empty, ask for the issue that proposes the component, or for
the tag and the role in one sentence, and nothing else.

The rules a component follows are in `projects/stencil/SPEC.md` (Authoring rules, Tests,
Per-component usage docs), the tests in `projects/stencil/HOWTO.md`. `mds-preview` (#1491) is the
example of the whole step: proposed by the pattern edit-with-preview, drawn first as a prototype,
built, then put in place of its prototype.

Work with the maintainer one decision at a time: every choice that is not written in a source
(a name, a default, a variant, a look) is a multiple-choice question with the recommended option
first, and every proposal of a look is shown rendered before it is kept.

## 1. The proposal

1. **Read it**: the issue (`gh issue view <n>`), the pattern that asked for the component (its
   `## Decisions`, the case whose `use` names it), and its prototype: the markup the previews
   draw with `data-prototype="<tag>"` (`docs/PATTERNS.md`, "A prototype"), which
   `render_preview` names in `prototypes`. Note the role, the API it implies (props, events,
   slots, parts) and the states the cases show.
2. **One component per role.** Check that none holds the role already: the catalogue
   (`docs/COMPONENTS.md`, the "Native analogue" column) and `find_component` of the MCP server
   with the role in words. One that holds it, even badly, is changed, not doubled: say so and
   stop (`/magma-dev:pattern-new`, step 2).
3. **Its place**: `@category <id>` when it stands alone, `@parent <tag>` when it is a part of a
   compound (`docs/COMPONENTS.md`, "Categories"). Ask when the issue does not say.
4. **Its branch**: from the issue, `gh issue develop <n> --base main` (or `--base <epic branch>`
   for a part of an epic), in a worktree of its own; never switch the branch of the main
   checkout (`docs/WORKFLOW.md`).

## 2. The scaffold

```bash
npx nx run stencil:generate <tag> --category <id>     # a component that stands alone
npx nx run stencil:generate <tag> --parent <tag>      # a part of a compound
```

It writes the component, its sheet with the design decisions on `:host`, the fouc and `pref-*`
sheets, a Vitest e2e, the stories file with its States story (the MDX page for a part) and the
three usage files, and prints what is left.

## 3. The API

Write it from the proposal, by the Authoring rules of `SPEC.md`: a prop with a fixed set of
values has a type and a dictionary in `meta/`, `reflect: true` when the CSS selects on it, a
boolean defaults to `false`; the text goes through a `label` prop; events are
`mds<Component><Action>`; every prop, event, method, slot and part has its JSDoc (`@part` and
`@slot` above `@Component`); the words in `meta/locale.*.json`. Replace the placeholder sentence
above `@Component` with what the component is for. Ask before naming a prop or a value the
proposal leaves open.

## 4. The look: the design decisions on :host

The colours, radii, shadows, motion (durations, easings) and `z-index` the tokens feed into the
component are custom properties on `:host`, with the token as default, read by the rules below;
spacing and geometry stay written in the rules ("The design decisions on `:host`" of `SPEC.md`).

- **Name each knob** `--<tag>[-<part>][-<variant>][-<state>]-<property>`, the state before the
  property, ending with the CSS property it sets (`radius`, `shadow`, `background` for short):
  `--mds-chip-selected-background`, `--mds-modal-window-max-height`. Document it with `@prop`;
  start its description with `Public.` only when a product needs it and no role, theme or prop
  gives it (Styling API).
- **A variant, a state or a preference** sets a knob again on its `:host(...)`, the rules below
  unchanged; keep a `pref-contrast` or `pref-mode` sheet only when it refines a knob, and delete
  the others with their `@import`.
- **Paint with the roles** (`docs/agents/color.md`), never a palette step for an interface
  colour; the literals only where `magma/token-values` allows them.

`npm run lint.css` (in `projects/stencil`) holds both points with `magma/host-knobs`; a new
component starts with nothing allowed in `scripts/host-knobs-pending.json`.

Show the look rendered before keeping it: the prototype of the preview and the component on the
build, side by side, in light and dark (`docs/PATTERNS.md`, the previews; `render_preview` on the
local build). The maintainer may retouch the knobs by hand: take their values as they leave them.

## 5. The states and the tests

- **The States story** (`SPEC.md`, Tests rule 5; `HOWTO.md`, "The States story"): every state the
  component has, the ones only an interaction reaches marked `play` and brought there by its play
  function. A part shows its states in the States story of its compound.
- **A Vitest test for every behaviour** (`SPEC.md`, Tests rule 1): props and defaults, events,
  methods, the rendered DOM, keyboard and focus, form participation; `*.e2e.ts` for the live DOM,
  `*.spec.ts` for pure logic. Keep the test of the knobs the scaffold wrote.
- More stories only when they show something the States story does not (a composition, a use
  case).

## 6. The usage docs

Fill `usage/1. Description.md`, `2. Examples.md` and `3. Mistakes.md` (`SPEC.md`, "Per-component
usage docs"): the intent of each prop's values, numbered examples with their code, mistakes as
INCORRECT/CORRECT pairs; no table of props, no rule that applies to every component.

## 7. In place of its prototype

Put the component in the previews of the pattern where its prototype stood (the markup with
`data-prototype="<tag>"` becomes `<tag>`), so `render_preview` no longer names a prototype and
the cases' `use` names the component as it is: `npx nx run mcp:serve.previews` to edit them on
the build, then `/magma-dev:pattern-change` on the pattern for its `## Decisions` if the build changed what
the pattern decided.

## 8. The checks

```bash
npx nx run stencil:build
npx nx run stencil:test
npx nx run stencil:test-storybook
npm run lint
npx nx run stencil:check.api-snapshot          # after the build: commit the magma.api.txt it rebuilds
npx nx run stencil:check.usage-docs
npx nx run stencil:check.states-stories
npx nx run stencil:check.types
npx nx run stencil:check.patterns
```

## 9. The gate: the design audit

Run `v2:design-audit` on the component, on its States story and on the pattern's preview where it
now stands: every check pass, fail or not verifiable. Fix every fail that is the component's;
the ones left (a token to fix on the token side, a choice of the maintainer) go into the pull
request with their reason. When the maintainer retouches the styles by hand, run it again on
their version.

## 10. The pull request

Bring the agent context up to date (`/magma-dev:context-review`), commit (`feat(<tag>): add ...`, ASCII
only, `docs/COMMITS.md`), check `origin/main` (or the branch of the epic) in its own step and
merge it if it moved, push the branch and open a pull request with `Closes #<issue>`, the
decisions taken, the result of the audit, and the table `Title | What to test | URL` of
`npx nx run magma:test.urls`. Never merge it on your own initiative.
