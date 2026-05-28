Common incorrect uses of `<mds-button>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

## 1. Do Not Put HTML in the Default Slot

The default slot accepts plain text only; nested elements are stripped or break layout. Use the `label` prop for text and the dedicated props/slots for everything else.

```html
<!-- 🚫 INCORRECT -->
<mds-button>
  <span class="bold">Scarica</span>
  <small>(PDF)</small>
</mds-button>

<!-- ✅ CORRECT -->
<mds-button label="Scarica (PDF)" icon="mi/baseline/download" variant="primary"></mds-button>
```

## 2. Do Not Nest `<mds-button>` Inside an Anchor

Wrapping the button in `<a>` creates nested interactive controls, breaks keyboard semantics, and fails accessibility audits. Use the `href` prop on the component instead - it switches the host to anchor behavior natively.

```html
<!-- 🚫 INCORRECT -->
<a href="/login">
  <mds-button label="Accedi"></mds-button>
</a>

<!-- ✅ CORRECT -->
<mds-button label="Accedi" href="/login"></mds-button>
```

## 3. Icon-Only Buttons Without an Accessible Name

When `label` is empty, the component has no text to derive `aria-label` / `title` from, and screen readers cannot announce the button. Always supply an explicit `aria-label` (or `title`) for icon-only buttons.

```html
<!-- 🚫 INCORRECT -->
<mds-button icon="mi/baseline/delete" variant="error" tone="text"></mds-button>

<!-- ✅ CORRECT -->
<mds-button icon="mi/baseline/delete" aria-label="Elimina elemento" variant="error" tone="text"></mds-button>
```

## 4. Do Not Slot `<mds-icon>` to Add an Icon

The component's `icon` prop renders the SVG through the shared icon-set service and positions it correctly via `icon-position`. Slotting `<mds-icon>` puts it in the text-only default slot, where it is stripped or misaligned.

```html
<!-- 🚫 INCORRECT -->
<mds-button>
  <mds-icon name="mi/baseline/add"></mds-icon>
  Aggiungi
</mds-button>

<!-- ✅ CORRECT -->
<mds-button label="Aggiungi" icon="mi/baseline/add" variant="secondary" tone="weak"></mds-button>
```

## 5. Do Not Use Legacy `ghost` or `quiet` Tone Values

`tone="ghost"` and `tone="quiet"` were renamed in Magma 2.0 to `outline` and `text`. The old values are no longer accepted by the typed `ToneBoxVariantType` and silently fall back to the default tone.

```html
<!-- 🚫 INCORRECT (Magma 1.x naming) -->
<mds-button label="Modifica" tone="ghost" variant="primary"></mds-button>
<mds-button label="Annulla" tone="quiet" variant="error"></mds-button>

<!-- ✅ CORRECT (Magma 2.x) -->
<mds-button label="Modifica" tone="outline" variant="primary"></mds-button>
<mds-button label="Annulla" tone="text" variant="error"></mds-button>
```

## 6. Customize via Documented Vars and Parts, Not Internal Selectors

The supported customization surface is `--mds-button-*` CSS custom properties plus the two documented shadow parts (`icon`, `label`). Targeting other internals via `::part()`, `>>>`, or undocumented class names couples your code to the Shadow DOM implementation and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-button >>> .text { font-weight: bold; }
mds-button::part(spinner) { color: red; }

/* ✅ CORRECT */
mds-button {
  --mds-button-color: rgb(var(--variant-primary-03));
  --mds-button-radius: var(--radius-lg);
}
mds-button::part(icon) {
  fill: rgb(var(--status-warning-05));
}
```
