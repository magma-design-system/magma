# icons — specification

`@maggioli-design-system/icons` builds the **icon font** (`mgg-icons`) and its CSS/SCSS/LESS
companions. It owns no icon artwork: every glyph is pulled from a source package and declared in
[`dictionary.json`](dictionary.json).

This document is the reference for adding or changing an icon.

---

## 1. Relationship with `svg-icons`

The two packages are different products and are released independently.

| | `svg-icons` | `icons` |
| --- | --- | --- |
| Ships | Optimised SVG files | A font + CSS classes |
| Content | Maggioli-authored artwork only | Maggioli artwork **and** third-party icons |
| Consumed by | `mds-icon` at runtime, via `iconsauce` | Any app that wants `<i class="mgg-icons-foo">` |
| Source of truth | `projects/svg-icons/svg/*.svg` | `projects/icons/dictionary.json` |

`icons` depends on `svg-icons` through the Yarn workspace symlink, so a local `svg-icons` build is
visible to the `icons` build immediately.

> ⚠️ **The two can drift silently.** An SVG added to `svg-icons` but never mapped in
> `dictionary.json` still works in `<mds-icon>` — `iconsauce` reads `svg-icons/dist` directly — but
> it is **absent from the font**. Nobody notices until someone asks why the CSS class is missing.
> [`scripts/check-dictionary.ts`](scripts/check-dictionary.ts) exists to make that drift loud.

---

## 2. `dictionary.json` format

A flat map of **font class name → source icon**:

```json
{
  "action-send": "material/send",
  "ai-brain": "maggioli/ai-brain",
  "calculator": "mdi/calculator"
}
```

- **The key** becomes the CSS class suffix: `"action-send"` → `.mgg-icons-action-send`. Allowed
  characters are `a-z`, `0-9`, `-` and `_`. It is the public API — renaming a key is a breaking
  change for consumers.
- **The value** is `<group>/<icon-name>`, resolved against one of four source packages.

### Groups

| Group | Source package | Looked up as |
| --- | --- | --- |
| `maggioli` | `@maggioli-design-system/svg-icons` | `svg/<name>.svg` |
| `material` | `material-design-icons-updated` | `icons/filled/*/ic_<name>_24px.svg` |
| `material-icons-svg` | `@material-icons/svg` | `svg/<name>/baseline.svg` |
| `mdi` | `@mdi/svg` | `svg/<name>.svg` |

Resolution lives in [`scripts/icons-groups.ts`](scripts/icons-groups.ts).

### Conventions

- **Keys need not match filenames.** `"binoculars"` maps to `maggioli/mdi-binoculars`,
  `"main-property"` to `maggioli/abitazione-principale`. Pick the key for the semantic role, not
  for the artwork.
- **Several keys may share one target**, and ~34 do: `material/ios_share` backs `action-export`,
  `share-alt` and `share`. This is intentional — aliases let consumers express intent.
- **The file is only roughly alphabetical.** Around 200 entries deviate from a strict sort
  (`action-close-circle` precedes `action-close`). Do **not** re-sort it: the diff would bury the
  real change. Insert new entries next to their alphabetical neighbours, which is what
  `yarn add` below does for you.

---

## 3. Adding icons

### 3.1 Maggioli artwork (new SVG)

```bash
# 1. drop the optimised .svg into projects/svg-icons/svg/
#    filename must match ^[a-z0-9-]+\.svg$

# 2. map every new source into the dictionary, alphabetically placed
yarn nx run icons:add --auto

# 3. verify sources and dictionary agree, before any build
yarn nx run icons:check

# 4. build both packages
yarn nx run icons:build          # builds svg-icons first, via the Nx dependency
```

To choose a key different from the filename, or to add a third-party icon instead:

```bash
yarn nx run icons:add my-key=maggioli/my-file
yarn nx run icons:add alarm-note=mdi/alarm-note
```

### 3.2 Intentionally unmapped sources

Some artwork is only meant for `<mds-icon>` and never for the font. Record it in
[`unmapped-icons.json`](unmapped-icons.json), otherwise `check` fails. That file is the visible
backlog of unmapped sources — **it should shrink, not grow**.

### 3.3 Do not bump versions by hand

`icons.release.yml` and `svg-icons.release.yml` derive the next version from the conventional-commit
scope and pin internal `@maggioli-design-system/*` dependencies automatically. Editing `version` or
the `@maggioli-design-system/svg-icons` pin in `package.json` only creates conflicts with the
release bot.

### 3.4 Commits

Two scopes, because they are two releases:

```
feat(svg-icons): add new icons     # projects/svg-icons/svg/*
feat(icons): add new icons         # projects/icons/dictionary.json
```

Full rules in [`docs/COMMITS.md`](../../docs/COMMITS.md).

---

## 4. Validation

`yarn nx run icons:check` runs [`scripts/check-dictionary.ts`](scripts/check-dictionary.ts) in under
a second, without building the font. It fails on:

| Problem | Why it matters |
| --- | --- |
| Entry whose source icon does not exist | The font build dies halfway with `Icon not found` |
| Maggioli source with no entry | The icon never reaches the font (the silent drift) |
| Key collision with an existing entry | The source is shadowed, e.g. `judge-hammer` → `mdi/gavel` |
| Duplicate key | `JSON.parse` keeps only the last one, silently overriding an icon |
| Illegal characters in a key or filename | Breaks the generated CSS class or the `svg-icons` build |
| Malformed entry line | The file is covered by neither `yarn format` nor ESLint |

It runs in three places: as `prebuild` of the font, as a `lint-staged` hook on
`dictionary.json` and `svg-icons/svg/*.svg`, and in CI via
[`icons-sync.yml`](../../.github/workflows/icons-sync.yml) — which triggers on **both** projects,
unlike `icons.yml` and `svg-icons.yml`.

Pass `--no-resolve` to skip third-party lookups when `node_modules` is unavailable.

---

## 5. Build outputs

`dist/` holds the semantic build, `dist/original/` the same font keyed by the **source** icon names
instead of the dictionary keys. Both ship `.css`, `.scss`, `.less`, `.styl`, a `base64/` variant
with the font inlined, and a `dictionary.json` describing what went in.

The `[class^="mgg-icons-"]` selectors emitted by `svgtofont` are expanded into an explicit class
list after the build: the attribute selectors are expensive for the browser, at the cost of a
larger file. See `optimizeSelectorCSS` in [`scripts/font-icons.ts`](scripts/font-icons.ts).
