---
name: migrate
description: Migrate a project to Magma 3 (@maggioli-design-system/magma) with the official codemod, from Magma 2 or, through Magma 2, from Magma 1. Find which major the code is written for, run the codemod as a dry run, review its report and what it leaves to a human, write the changes on a clean git tree, then fix what the build and the Magma lint report. Use when asked to upgrade or migrate Magma, or when code uses names or colour forms the installed Magma no longer has.
license: MIT
compatibility: A project in git with Magma 2 or Magma 1 code. Runs the codemod with npx.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

<!-- Generated from projects/claude-plugin/templates/migrate.md by scripts/skills.ts: edit the template. -->

# Migrate to Magma 3

The folders to migrate, if given with the command: $ARGUMENTS. Without them, the sources of the project (`src`).

## 1. Prepare

1. Find the major the code is written for, and write it in every command below as `--from 2` or `--from 1`. The version of `@maggioli-design-system/magma` in `package.json` says which packages are installed, not where the code stands: a project may upgrade the packages before or after the rewrite. Code on Magma 2 paints with the semantic roles (`bg-surface-raised`, `rgb(var(--magma-*))`) and uses `mds-pref-mode`; code on Magma 1 uses names the Magma 1 -> 2 codemod renames (`tone="ghost"`, the light / dark control written `mds-pref-theme`, `mobile:` meaning phones). When the code does not tell, ask the person: never pass `--from 1` on Magma 2 code, since the Magma 1 -> 2 rules add attributes that keep the Magma 1 defaults.
2. The codemod rewrites code; the packages are upgraded with the setup of Magma 3 (`/magma:setup`), before or after the rewrite.
3. Make sure the git tree is clean: the codemod writes in place, and `git checkout` is the undo.

## 2. Dry run

```bash
npx @maggioli-design-system/magma-codemods --from 2 --path src --report-md magma-migration.md
```

`magma-codemods` prints a diff and a summary and writes nothing by default. With `--from 1` it runs Magma 1 -> 2, then Magma 2 -> 3 on what the first jump wrote, and each finding names its jump. If it rejects `--from`, the codemod npm serves is older than the jump to Magma 3: stop and tell the person.

Read `magma-migration.md`: what the codemod cannot decide alone is listed by token and by file. For Magma 3 that is mostly colours: a colour token is a full colour, no longer three channels, so `rgb(var(--magma-x))` becomes `var(--magma-x)` and an alpha a `color-mix()`; a colour built in a string of the scripts, a value that may hold channels of the project's own, and `rgba(var(--x), a)` are reported with the rewrite to make.

The spacing utilities with a t-shirt name become numeric steps (`p-md` -> `p-400`): a t-shirt name is a container size in Magma 3. A class whose value changes is reported instead: a logical size with a t-shirt name (`inline-2xl` was the spacing step and is the container), `leading-none` and `max-inline-none` (0 in Magma 2), and a measure of text used as a spacing step (`p-prose`, no class in Magma 3). Keep the class when the new value is the one meant, otherwise write what the report gives.

## 3. Write

```bash
npx @maggioli-design-system/magma-codemods --from 2 --path src --write
```

From Magma 1, `--accept-semantic=exact` also writes the raw palette classes whose role has the same value; `--accept-semantic=near` the near ones too, to review one by one. Angular external templates need `--framework angular`. Run `npx @maggioli-design-system/magma-codemods --help` for every option.

## 4. Finish

1. Resolve the findings of the report by hand: `suggest_role` of the magma server gives the role of a colour, `get_component` the props of a component.
2. Search the stylesheets for `rgb(var(` left over: the codemod rewrites the reads of Magma's colours, not a variable of the project that holds one (`--brand: var(--magma-accent)` read as `rgb(var(--brand) / 0.5)` paints nothing in Magma 3: read it as `color-mix(in srgb, var(--brand) 50%, transparent)`).
3. Build the app, run the Magma lint, and fix what they report (`/magma:review` checks the result).
4. Report what the codemod changed, the findings resolved by hand, and what is left.
