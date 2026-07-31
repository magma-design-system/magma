# Theme system - design note (epic #328)

Status: DRAFT / design agreement to review. Not yet implemented.
Scope: the "named theme" (variant) round-trip and the component model around it.

## 1. Why

Verified live in Storybook (Common tests / Semantic surfaces / Preferences):

- light <-> dark works (surface-default 242,242,242 -> 22,22,22 via `pref-theme-dark`
  and `pref-theme-scheme-dark`);
- picking a theme VARIANT is inert (data-theme-name=cool/magma leaves `--magma-*`
  unchanged);
- contrast is inert on the semantic layer.

Root causes: the variant components write the root attribute but no CSS consumes it
in the right namespace - `theme.css` repoints `--mds-tint-*` while the semantic layer
reads `--magma-tint-*`; `theme.css` is also not imported in `.storybook/styles.css`;
and the story offers names (`magma`, `maggioli-editore`) that are not real families.

## 2. Core principle: a theme is a multi-axis cosmetic aggregate

`data-theme-name='X'` is the single anchor on `<html>`. A theme aggregates several
cosmetic dimensions under that one name:

- COLOR (this release): retint the neutral scaffolding to a family.
- FUTURE: spacing, border/radius, shadow/elevation, and other cosmetic tokens.

Each dimension contributes its own override block for `[data-theme-name='X']` from its
own source; together they compose the theme. Color is the first dimension implemented.
`--depth` in `theme.css` (shadow/elevation) is already an early cosmetic axis and will
converge under this umbrella.

Implication: shape the NAME and the anchor attribute now so future dimensions attach
without rework. Do NOT over-build the future dimensions; implement color only for now.

## 3. Two orthogonal lanes (management model)

- Lane A - mode: `mds-pref-theme` = user preference `light | dark | system`. Writes
  class `pref-theme-{mode}` on `<html>`.
- Lane B - theme: `mds-pref-theme-variant` (+ `-item`) = which theme. Writes
  `data-theme-name`, `pref-theme-name-<name>`, `pref-theme-scheme-{scheme}`.

The two lanes are independent; the CSS combines them. No component disables another.
Cross-lane coordination lives only in the `mds-pref` controller.

## 4. Components and attributes

| Component | Role | Attributes |
| --- | --- | --- |
| `mds-pref` | controller/orchestrator (`controller` prop); listens to sub-component events; shows reload-notice; the ONLY place for cross-lane logic | `controller`, `size` |
| `mds-pref-theme` | lane A only: the mode preference | mode `light \| dark \| system` |
| `mds-pref-theme-variant` | lane B: which theme; manages `selected` of its items; writes the root | `name`, `scheme` (`light \| dark \| all`), `size` |
| `mds-pref-theme-variant-item` | one selectable theme | `name`, `label`, `scheme`, `selected` |

`name` is the theme key (see the map in section 6), NOT necessarily a color-family name.

## 5. The `scheme` axis (a theme's light/dark rails) - AGREED, already works

Semantics: a `scheme="light"` theme keeps the rendering light even if the user's mode
preference is `dark`. The user preference is NEVER discarded - it stays in localStorage
and re-applies as soon as a `scheme="all"` (or `dark`) theme is active again. The theme
wins on the RENDERING; the preference is preserved, not mirrored 1:1.

Mechanism already present and correct - do NOT change it:

```
:root:not(.pref-theme-scheme-light).pref-theme-dark,
:root.pref-theme-scheme-dark { ...dark values... }
```

`pref-theme-scheme-light` suppresses the dark flip; `pref-theme-scheme-dark` forces it;
`pref-theme-scheme-all` lets the mode lane decide. Note: every family has BOTH a light
and a dark scale generated, so "light-only" is editorial, not a token limitation.

Optional UI coordination (via the controller, not the individual components): on a
light-only theme, `mds-pref` disables the `dark` item in `mds-pref-theme` (explicit
`dark` only; leave `system`). It does NOT touch the stored preference. Needs: `mds-pref`
to listen to `mdsPrefThemeVariantChange {name, scheme}` (today it only listens to the
generic `mdsPrefChange {preference}`), and `mds-pref-theme` to expose a lock prop
(e.g. `locked-scheme`).

## 6. The color axis (`data-theme-name` -> family) - THE MISSING PIECE now

Contract (SEMANTIC_COLOR_SPEC.md section 8): a color theme repoints ONE block,
`--magma-tint-{surface,border,text}-*`, to another family's `--surface/border/text-*`.
Surface + border + text retint together (the foreground counterpart is already folded
into the tint block); text is APCA-verified (A7) against that same family's surfaces.

Single source of truth - a `name -> family` map in `semantic.config.ts`:

```ts
themes: {
  default: 'neutral',   // base :root, NO override rule emitted
  magma:   'neutral',   // brand name; own family later if desired
  cool:    'porcelain',
  warm:    'bisque',
}
```

- Generation: promote the logic that ALREADY exists in the playground
  (`design-tokens/playground/src/themes.tsx:73-82`, correct `--magma-tint-*` namespace)
  to a BUILD TARGET that emits `build/css/themes.css` (staged like `semantic.css` after
  #596) -> copied to `dist/css/themes.css`.
- Loading: add the import to `.storybook/styles.css` (missing today) and document it for
  consumers (agents `assets.md`).
- Retire: the named-theme rules in `styles/css/theme.css` (`--mds-tint-*`, wrong
  namespace) are removed/replaced; `theme.css` stays for the depth/elevation axis.
- `default`: emits NO rule (it is the base `:root`); the `default` item just clears any
  active `data-theme-name`.
- Families that exist today: `neutral`, `porcelain`, `bisque` (each with light+dark).

## 7. Contrast (note, out of immediate scope)

`pref-contrast-*` does not touch any `--magma-*`; contrast is honored only by ~57 legacy
per-component `--tone-*` sheets. Wiring contrast into the semantic layer is a separate
follow-up.

## 8. Residual fixes in the parked components

- `mds-pref-theme-variant.css`: selector is `mds-pref-language` (copy-paste) -> should be
  `:host`, otherwise the grid layout never applies.
- `mds-pref-theme-variant-item.css`: preview swatch uses `--tint-base-lv1` (superseded
  draft token, spec section 8) -> use real surface roles, so previews show the theme.
- `mds-pref-theme-variant.tsx`: `@Element` typed `HTMLMdsPrefLanguageElement` (copy-paste).

## 9. Open decisions

1. Accent retint: the spec says the accent hue follows the same repoint pattern; today it
   is neither generated by the playground nor in the right namespace (`--mds-accent-*` in
   `theme.css`). Include now, or phase 2?
2. `magma` brand: reuse the `neutral` family (a named alias of default) or give it its own
   family later?
3. Where the `themes.css` generator lives (inside `semantic.ts` or a dedicated target) and
   how it gets the list of surface-opted families (reuse `createColorTokens` as the
   playground does, or an explicit list).
4. Future cosmetic dimensions (spacing/border/shadow): confirmed they converge under
   `data-theme-name`; the per-dimension source/generator is deferred.

## 10. Proposed implementation order

1. `themes` map in `semantic.config.ts` + generator -> `build/css/themes.css` + copy to
   `dist/css/themes.css`.
2. Import `themes.css` in `.storybook/styles.css`; retire the named-theme rules in
   `theme.css`.
3. Align the story `name`s to the map (drop `magma`/`maggioli-editore` or map them).
4. Residual component fixes (section 8).
5. Later: controller lock-dark coordination; contrast wiring; accent retint; the future
   cosmetic axes.
