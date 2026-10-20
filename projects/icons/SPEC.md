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

`icons` depends on `svg-icons` through the npm workspace symlink, so a local `svg-icons` build is
visible to the `icons` build immediately. The web components do **not** depend on `icons`.

> ⚠️ **Adding a source does not add a glyph.** An SVG added to `svg-icons` but never mapped in
> `dictionary.json` still works in `<mds-icon>` — `iconsauce` reads `svg-icons/dist` directly — but
> it is **absent from the font**, and nothing signals it. That is often the intended outcome (see
> §3.2); what must not happen is reaching it by accident.
> [`scripts/check-dictionary.ts`](scripts/check-dictionary.ts) forces the choice to be explicit.

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
- **Keys are in strict alphabetical order — keep it on every addition.** The order compares each
  key *with its quotes*, the way an editor's "sort lines ascending" does on the raw lines. Unicode
  collation ranks `_` before `-` before `"`, so a key comes **after** every key that extends it:

  ```json
  "ghost-outline": "mdi/ghost-outline",
  "ghost": "mdi/ghost",
  ```

  Sorting the bare keys instead would put `ghost` first and misplace ~200 entries, every variant
  listed before its base. `add.icons` inserts at the right place, and `check.dictionary` fails on
  any entry out of order. The rule lives in
  [`scripts/dictionary-order.ts`](scripts/dictionary-order.ts).

---

## 3. Adding icons

### 3.1 Maggioli artwork (new SVG)

```bash
# 1. drop the optimised .svg into projects/svg-icons/svg/
#    the filename is the public slug and must match ^[a-z0-9-]+\.svg$

# 2. map every new source into the dictionary, alphabetically placed
nx run icons:add.icons --auto

# 3. verify sources and dictionary agree, before any build
nx run icons:check.dictionary

# 4. build both packages (icons pulls svg-icons in as an Nx dependency)
nx run icons:build
```

To choose a key different from the filename, or to add a third-party icon instead:

```bash
nx run icons:add.icons my-key=maggioli/my-file
nx run icons:add.icons alarm-note=mdi/alarm-note
```

### 3.2 Sources that stay out of the font

A good deal of the artwork exists **only** for `<mds-icon>`: authored for iconsauce, never
requested in this package. That is a normal outcome, not an oversight — the font is a curated
subset, not a mirror of `svg-icons`.

Record such a source in [`unmapped-icons.json`](unmapped-icons.json), otherwise `check.dictionary`
fails. The file is a declaration of intent: an entry means the choice was made deliberately. Its
only job is to stop a source from being left out by accident, with nobody noticing. If one of
those icons is later needed in the font, it gets its own pull request.

### 3.3 Do not bump versions by hand

`release.yml` detects each package's next version from its own commits, writes it, and updates the
pins of the packages that depend on it. Editing `version` or the `@maggioli-design-system/svg-icons`
pin in `package.json` only creates conflicts with the release automation.

Both `icons` and `svg-icons` opt into publishing from `dev` (the `dev-publish` flag of the
`publish.yml` matrix), so an icon reaches npm without waiting for a `main` release.

### 3.4 Commits

Two scopes, because they are two releases:

```
feat(svg-icons): add new icons     # projects/svg-icons/svg/*
feat(icons): add new icons         # projects/icons/dictionary.json
```

Full rules in [`docs/COMMITS.md`](../../docs/COMMITS.md); branching and PR rules in
[`docs/WORKFLOW.md`](../../docs/WORKFLOW.md).

---

## 4. Validation

`nx run icons:check.dictionary` runs [`scripts/check-dictionary.ts`](scripts/check-dictionary.ts) in
under a second, without building the font. It fails on:

| Problem | Why it matters |
| --- | --- |
| Entry whose source icon does not exist | The font build dies halfway with `Icon not found` |
| Maggioli source neither mapped nor declared | Nobody decided whether it belongs in the font |
| Key collision with an existing entry | The source is shadowed, e.g. `judge-hammer` → `mdi/gavel` |
| Duplicate key | `JSON.parse` keeps only the last one, silently overriding an icon |
| Entry out of alphabetical order | The file is kept strictly sorted (§2); the error names the pair |
| Illegal characters in a key or filename | Breaks the generated CSS class or the `svg-icons` build |
| Malformed entry line | The file is covered by neither `npm run format` nor ESLint |

It runs in three places:

- as `prebuild` of the font, so a mistake fails immediately instead of mid-build;
- as a `lint-staged` hook on `dictionary.json` and `svg-icons/svg/*.svg`;
- in CI through the `icons` pipeline, which declares
  `extra-path: projects/svg-icons/svg/**` so that adding a source — a file this project verifies
  but does not own — also triggers it.

Pass `--no-resolve` to skip third-party lookups when `node_modules` is unavailable.

---

## 5. Build outputs

`dist/` holds the semantic build, `dist/original/` the same font keyed by the **source** icon names
instead of the dictionary keys. Both ship `.css`, `.scss`, `.less`, `.styl`, a `base64/` variant
with the font inlined, and a `dictionary.json` describing what went in.

The `[class^="mgg-icons-"]` selectors emitted by `svgtofont` are expanded into an explicit class
list after the build: the attribute selectors are expensive for the browser, at the cost of a
larger file. See `optimizeSelectorCSS` in [`scripts/font-icons.ts`](scripts/font-icons.ts).
