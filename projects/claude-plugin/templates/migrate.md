---
name: migrate
description: Migrate a project to Magma 3 (@maggioli-design-system/magma) with the official codemod, from Magma 2 or, through Magma 2, from Magma 1. Find which major the code is written for, run the codemod as a dry run, review its report and what it leaves to a human, write the changes on a clean git tree, then fix what the build and the Magma lint report. Use when asked to upgrade or migrate Magma, or when code uses names or colour forms the installed Magma no longer has.
license: MIT
compatibility: A project in git with Magma 2 or Magma 1 code. Runs the codemod with npx.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

# Migrate to Magma 3

The folders to migrate, if given with the command: {{arguments}}. Without them, the sources of the project (`src`).

## 1. Prepare

1. Find the major the code is written for, and write it in every command below as `--from 2` or `--from 1`. The version of `@maggioli-design-system/magma` in `package.json` says which packages are installed, not where the code stands: a project may upgrade the packages before or after the rewrite. Code on Magma 2 paints with the semantic roles (`bg-surface-raised`, `rgb(var(--magma-*))`) and uses `mds-pref-mode`; code on Magma 1 uses names the Magma 1 -> 2 codemod renames (`tone="ghost"`, the light / dark control written `mds-pref-theme`, `mobile:` meaning phones). When the code does not tell, ask the person: never pass `--from 1` on Magma 2 code, since the Magma 1 -> 2 rules add attributes that keep the Magma 1 defaults.
2. The codemod rewrites code; the packages are upgraded with the setup of Magma 3 (`/magma:setup`), before or after the rewrite.
3. Make sure the git tree is clean: the codemod writes in place, and `git checkout` is the undo.

## 2. Dry run

```bash
npx {{codemod}} --from 2 --path src --report-md magma-migration.md
```

`{{codemodBin}}` prints a diff and a summary and writes nothing by default. With `--from 1` it runs Magma 1 -> 2, then Magma 2 -> 3 on what the first jump wrote, and each finding names its jump. If it rejects `--from`, the codemod npm serves is older than the jump to Magma 3: stop and tell the person.

Read `magma-migration.md`: what the codemod cannot decide alone is listed by token and by file. For Magma 3 that is mostly colours: a colour token is a full colour, no longer three channels, so `rgb(var(--magma-x))` becomes `var(--magma-x)` and an alpha a `color-mix()`; a colour built in a string of the scripts, a value that may hold channels of the project's own, and `rgba(var(--x), a)` are reported with the rewrite to make. An item of an accordion that leaves `typography` out is flagged too: its title is `h6` in Magma 3, the style of a part, no longer `h5`. Leave it out, so the item follows the design language; write `typography="h5"` only when the person wants the look of Magma 2 back.

## 3. Write

```bash
npx {{codemod}} --from 2 --path src --write
```

From Magma 1, `--accept-semantic=exact` also writes the raw palette classes whose role has the same value; `--accept-semantic=near` the near ones too, to review one by one. Angular external templates need `--framework angular`. Run `npx {{codemod}} --help` for every option.

## 4. Finish

1. Resolve the findings of the report by hand: `suggest_role` of the magma server gives the role of a colour, `get_component` the props of a component.
2. Search the stylesheets for `rgb(var(` left over: the codemod rewrites the reads of Magma's colours, not a variable of the project that holds one (`--brand: var(--magma-accent)` read as `rgb(var(--brand) / 0.5)` paints nothing in Magma 3: read it as `color-mix(in srgb, var(--brand) 50%, transparent)`).
3. Build the app, run the Magma lint, and fix what they report (`/magma:review` checks the result).
4. Report what the codemod changed, the findings resolved by hand, and what is left.
