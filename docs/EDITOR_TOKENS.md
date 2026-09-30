# Editor autocomplete for tokens

This document is the **contributor-facing** setup and decision record for token
autocomplete in the editor: how to get `var(--...)` completion over the whole token
surface, why it is fed by a generated file, and which of the extensions in this space do
and do not work. For the **consumer-facing** version (a project that installs the
packages), see the "Editor autocomplete" section of
[`projects/styles/README.md`](../projects/styles/README.md).

## Setup

1. Install [CSS Var Complete](https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar)
   (`phoenisx.cssvar`) and uninstall `vunguyentuan.vscode-css-variables` if present - see
   [Extensions](#extensions).
2. Build the styles package once, so the generated sheet exists:
   `nx run styles:build`.
3. Put this in `.vscode/settings.json`. The folder is gitignored, so it stays local and
   every contributor pastes it from here:

```json
{
  "cssvar.files": ["projects/styles/dist/css/tokens.editor.css"],
  "cssvar.ignore": [],
  "cssvar.disableSort": true,

  "[css]": {
    "editor.inlineSuggest.enabled": false
  }
}
```

4. Reload the window.

You then get, inside `var(`: the list opening on its own, one entry per token, scales in
scale order, the value in the completion detail, a color swatch on color tokens, and
go-to-definition into the generated sheet.

Optional: `"colorInfo.languages": []` if you have Color Info installed - see
[Extensions](#extensions).

## What feeds it

[`projects/styles/scripts/editor-tokens.ts`](../projects/styles/scripts/editor-tokens.ts)
generates `dist/css/tokens.editor.css` as build step `editor.tokens`, between `properties`
and `copy`. It collects, deduplicating (first occurrence wins) and grouping:

| group       | source                             | tokens emitted |
| ----------- | ---------------------------------- | -------------- |
| `scale`     | design-tokens `typography.css`     | 207            |
| `motion`    | design-tokens `transitions.css`    | 2              |
| `palette`   | design-tokens `colors-rgb.css`     | 381            |
| `semantic`  | `build/css/semantic.css`           | 159            |
| `globals`   | `css/globals.css`, `css/theme.css` | 38             |
| `component` | per component, see below           | 804            |
| **total**   |                                    | **1591**       |

The counts are what each group *emits*, after dedup against the groups before it: most of
the motion scale (`--duration-*`, `--ease-*`) is already published by `typography.css`, so
`transitions.css` only adds the two names it owns alone.

The component group merges both places a component token is published: the `@property`
registrations aggregated by `properties.ts` (whose default is already resolved to a
literal) and the declarations a component makes on its own `:host`. Two thirds of the
surface is registered, the rest only declared, and a completion list needs all of it.

Four properties of the output are load-bearing, not cosmetic:

- **one entry per token.** Editors dedupe per file, not across files, and the token layer
  ships the same names four to eight times over: the design-tokens output is copied into
  `styles/dist/css`, every scale exists both as `:root` and as an `@theme` bridge, and
  `colors-rgb.css` restates what `colors-rgb-label.css` already holds. Pointing an editor
  at the real stylesheets is what produced `--label-yellow-09` eight times.
- **the file's order is the list's order**, once the editor's own sort is off. Families
  keep the order the design system declares them in, and a family whose values are all
  numbers in the same unit is sorted ascending: `--radius-none 0px` through
  `--radius-full 1000px`.
- **every value on one line.** See [Traps](#traps).
- **palette triplets written as `rgb(112 85 4)`.** A palette token holds a bare triplet,
  to be read as `rgb(var(--label-yellow-03))`, and no editor can preview that: a triplet
  is not a color. Wrapping it in the generated file - which no browser loads - is what
  gives 726 of the tokens a real swatch. The token itself still holds the triplet.

Deliberately out: `--private-*` (a component's internal wiring, declared in the file that
uses it, where same-document completion already covers it), the `colors-hex-*` sheets (the
same palette in a second format), the `tailwind-theme-*` bridges (the same names inside
`@theme`) and Tailwind's own `theme.css` (51 names in common with our `typography.css`).

Coverage, measured against what the component sheets actually use inside `var()`: 1009 of
1120 distinct tokens. The remaining 111 are the 73 `--private-*`, 6 tokens Tailwind's
theme publishes (`--ease-in-out`, `--drop-shadow-sm`, ...) and 32 one-off local names.

## Extensions

| extension                              | verdict                                                                                                                                                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phoenisx.cssvar` (CSS Var Complete)   | **use it.** Registers its completion provider with trigger characters `-`, `v`, `a`, `r`, so the list opens while typing; `cssvar.disableSort: true` stamps an index-based `sortText`, which is what preserves our order.       |
| `vunguyentuan.vscode-css-variables`    | **remove it.** Hardcodes `sortText: "z"` on every item, so VS Code falls back to alphabetical (`--radius-2xl` before `--radius-3xs`), and declares no trigger characters, so the list never opens by itself. Also duplicates every entry alongside the other extension. |
| `bradlc.vscode-tailwindcss`            | **keep it.** It completes `@theme` names inside `var(` when it has resolved a v4 design system, index-sorted with resolved values - but those cover only 52 of the 1120 tokens the components use, so it is a complement, not an alternative. Do not also feed those files to `cssvar`. |
| `bierner.color-info`                   | **disable for CSS** (`"colorInfo.languages": []`). It matches CSS named colors inside identifiers, so hovering `--label-yellow-03` (really `112 85 4`, a dark olive) shows pure yellow.                                     |
| VS Code built-in CSS                   | Completes `var()` only from the **current document** (an `@property` in the same file counts), and `css.customData` does not feed `var()` at all - it only completes a token NAME in property position. `findDocumentColors` returns nothing for `rgb(var(--x))`, even when the token is declared in the same file. |

## Traps

- **`cssvar.ignore` overrides `cssvar.files`.** It defaults to `["**/node_modules/**"]` and
  is applied as fast-glob's `ignore` over the file globs, so an explicit path inside
  `node_modules` is dropped unless the ignore list is emptied. The same holds for
  `cssVariables.blacklistFolders` in the other extension.
- **Multi-line `var()` values crash CSS Var Complete.** Its `getVariableType` recurses on
  `value.replace(/var\s*\((.*?)\)/, "$1")`, whose `.` does not cross newlines, so a value
  Prettier wrapped over several lines is a fixed point and the recursion never ends:
  `Populating Variable Values: RangeError: Maximum call stack size exceeded`. 99 of the
  component declarations are wrapped exactly that way, which is why the generator collapses
  every value onto one line. Do not add the component sheets to `cssvar.files`.
- **No swatch on a fallback chain.** The color provider scans each line with
  `/var\s*\((.*?)\)/g`, so on
  `var(--magma-selection-background, rgb(var(--label-yellow-09)))` it captures
  `--magma-selection-background, rgb(var(--label-yellow-09` as one name, finds nothing, and
  draws nothing. Simple `rgb(var(--x))` is fine.
- **The generated sheet must exist.** It lives in `dist/`, which is gitignored: a fresh
  clone has no completion until `nx run styles:build` has run once.
- **Never import `tokens.editor.css`.** It holds light-theme defaults only, so loading it
  would pin every token at the highest-priority origin and freeze theming. It is wrapped in
  a query that can never match, which makes an accidental import a no-op.

Both CSS Var Complete bugs above are one-line fixes upstream (an `s` flag, or a parser
instead of a regex) and are worth reporting.
