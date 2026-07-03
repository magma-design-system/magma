# @maggioli-design-system/magma-codemods

Codemods to migrate consumer code of [`@maggioli-design-system/magma`](https://www.npmjs.com/package/@maggioli-design-system/magma)
from **v1** to **v2**. They rewrite HTML, React (JSX/TSX), Angular templates (external `.html` and inline
`@Component({ template })`) and CSS/SCSS, applying the breaking changes automatically and reporting the cases that
need a human decision.

ESM package, Node ≥ 22.

## Usage

```bash
npx @maggioli-design-system/magma-codemods --path ./src
```

By default the tool runs in **dry-run** (prints a coloured diff + a summary, writes nothing). Pass `--write` to
apply the changes in place.

```
--framework <react|angular|html|css|auto>   surface (default: auto, inferred from the extension)
--path <file|dir>                            file or directory to scan (repeatable; positional args also work)
--dry-run                                    print a diff and report, write nothing (DEFAULT)
--write                                      apply changes in place
--force                                      allow --write on a dirty git working tree
--ignore <glob>                              extra ignore globs (repeatable)
--report <path>                              write the JSON report
--only <ruleId,...> / --skip <ruleId,...>    run/skip specific rules (see the ids in the report)
--manifest <path>                            override the bundled manifest (JSON)
-h, --help
```

Notes:
- `auto` maps `.css/.scss → css`, `.tsx/.jsx → react`, `.ts → Angular inline templates`, `.html → html`. For
  **Angular external templates** (`.html`), pass `--framework angular`.
- `--write` refuses to run on a dirty git working tree unless `--force`, so the undo is always `git checkout`.
- `node_modules`, `dist`, `.git`, `build`, `.next` and `coverage` are ignored by default.

## Migration matrix

| # | Category | What it does | Confidence |
|---|----------|--------------|------------|
| A | Enum remap (`tone`) | `ghost → outline`, `quiet → weak`; validated against each component's v2 set | safe with validation |
| B | Boolean inversion | rename + negate value: `arrow → hideArrow`, `autoPlacement → disableAutoPlacement`, `backdrop → hideBackdrop`, `cockade → hideCockade`, `showDownloadedIcon → hideDownloadedIcon`, … plus the curated pairs the name heuristic cannot see: `closable → disableClose`, `visible → dismissed` | safe |
| C | Prop removal | warn + inline comment (HTML) / report (JSX, Angular): e.g. `mds-button hasText`, `mds-modal animating` | report |
| D | Prop rename | `mds-label labelAction → label` | curated |
| E | Misc enum shifts | remap or flag | mixed |
| F | `slot="default"` removal | drop the attribute (v2 uses the unnamed default slot) | safe |
| F2 | Slot → attribute (preferred) | lift slotted text into an attribute: `mds-button` `Save` → `label="Save"` (`label={expr}` / `[label]="expr"` for dynamic). Element/mixed content → reported | text: safe · markup: manual |
| F3 | Removed named slot | report children using a slot dropped in v2: `mds-push-notification` `slot="top"` / `slot="bottom"` | report |
| G | CSS custom property rename | `--mds-*-ghost-* → --mds-*-outline-*`, `--mds-*-color → --mds-*-color-rgb` (value hex → `R G B` flagged) | name: safe · value: manual |
| G2 | CSS custom property removal | warn on definitions/`var()` references of the ~20 properties removed with no replacement (e.g. `--mds-banner-gap`, `--mds-table-cell-*`) | report |
| H | Shadow part rename | rename in `::part()` selectors | safe |
| I | Event rename | declared in the manifest schema, but **not implemented by any surface yet** — no event was renamed between v1.12 and v2.0.0-beta, so no rule currently exists | n/a |

The bundled manifest is built by diffing the two `documentation.json` builds (`manifest.generated.ts`) with curated
corrections layered on top in `src/manifest/manifest.ts`.

### Behaviour guards (preserving v1 defaults)

Some inversions also flip the *default* behaviour. On `mds-dropdown`, v1 had auto-placement **off** by default
(`auto-placement` opt-in) while v2 has it **on** (`disable-auto-placement` opt-out). To keep the v1 behaviour, the
codemod adds `disable-auto-placement` to dropdowns that set neither prop:

| Input | Output |
|---|---|
| `<mds-dropdown>` (auto-placement was off) | `<mds-dropdown disable-auto-placement>` (stays off) |
| `<mds-dropdown auto-placement>` (was on) | `<mds-dropdown>` (stays on — v2 default) |

(`mds-tooltip`'s auto-placement default did not change, so no guard is applied there.)

The same guard covers other default flips (same prop, new default — invisible to the docs diff):

| Component | v1 default | v2 default | Guard |
|---|---|---|---|
| `mds-push-notification-item` | `deletable` on | off | adds `deletable` |
| `mds-banner` | `variant="light"` | `primary` | adds `variant="light"` |
| `mds-label` | no truncation | `truncate="word"` | adds `truncate="none"` |

(`mds-emoji`'s default `name` changed `hexabot → mia`; deliberately not guarded — treat it as branding.)

## What it cannot rewrite (reported, not changed)

These are surfaced under the **dynamic / manual** category in the report:

- React **spread props** (`<MdsButton {...props} />`), aliased components, computed prop names.
- Dynamic enum values (`tone={expr}` / `[tone]="expr"`).
- Slot content that contains **markup** (e.g. `<mds-icon>` inside `mds-button`).
- Inline templates / HTML in template literals that contain `${…}` interpolation.
- Angular `@Component({ host })` bindings are intentionally left untouched (rewriting a consumer component's own
  host with `mds-*` rules is rarely correct).

Out of scope entirely (all surfaces work on markup/templates only):

- **Imperative code**: `el.backdrop = false`, `setAttribute('cockade', …)`, `addEventListener('mdsX', …)`
  in plain JS/TS is never rewritten or reported.
- **`eventRename`** exists in the manifest schema but no surface implements it — no event was renamed
  between v1.12 and v2.0.0-beta, so no rule exists today. Implement it before the first real event rename.

## Development

```bash
yarn nx run codemod:build     # tsc → dist/
yarn nx run codemod:test      # jest (ESM)
```

### Regenerating the manifest from the docs

```bash
# v2 docs come from a `dev` build; v1 docs from a one-off build of `support/v1.x` in a worktree.
FROM_VERSION=1.12.0 TO_VERSION=2.0.0 \
  yarn generate.candidate <v1 documentation.json> <v2 documentation.json> src/manifest/manifest.candidate.json
```

Review the candidate and merge confirmed rules into `src/manifest/manifest.ts`.

Caveats when producing the two `documentation.json`:

- A docs-only build (`stencil docs`) on `support/v1.x` does **not** extract the `styles` section (the CSS
  `@prop` annotations), so every `cssVarRename` would silently drop from the candidate. Use a full
  `npm run build`, or inject the `styles` arrays from the `@prop` comments before diffing.
- Both builds need the generated fixtures first: `npm run build.icons` (v1 also needs
  `npm run storybook.version`).

## Release

Two dedicated, independent GitHub Actions workflows (not part of the shared semantic-release flow):

- **`codemods-ci.yml`** — build + test, on push to `dev` and on pull requests touching `projects/codemod/**`.
- **`codemods-publish.yml`** — manual (`workflow_dispatch`): build + test → bump (`patch|minor|major|pre*`,
  with a selectable prerelease id) → `npm publish` via OIDC trusted publishing → push the tag
  `magma-codemods@<version>`. No commit is pushed to `main` (tag-only). Run it with `dry-run: true` first.
