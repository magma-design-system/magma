Correct and idiomatic ways to use the `<mds-button>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

## 1. Text Button via `label` Prop

The canonical form. Use the `label` prop for the button's text; it doubles as `aria-label` and `title`, so screen readers and tooltips work without extra wiring.

```html
<mds-button label="Conferma azione" variant="primary" tone="strong"></mds-button>
```

## 2. Variant and Tone for Emphasis

Pair the same `variant` with a different `tone` to express importance. Do not invent custom colors to dim or saturate.

```html
<!-- High emphasis: primary call to action -->
<mds-button label="Salva" variant="primary" tone="strong"></mds-button>

<!-- Medium emphasis: supporting action -->
<mds-button label="Modifica" variant="primary" tone="outline"></mds-button>

<!-- Low emphasis: in-text or destructive secondary action -->
<mds-button label="Annulla" variant="error" tone="text"></mds-button>
```

## 3. Sizing

Use the `size` prop. Do not override dimensions with inline `width` / `height`.

```html
<mds-button label="Small" size="sm" variant="primary"></mds-button>
<mds-button label="Medium" size="md" variant="primary"></mds-button>
<mds-button label="Large" size="lg" variant="primary"></mds-button>
<mds-button label="Extra large" size="xl" variant="primary"></mds-button>
```

## 4. Button with Icon

Reference icons by their filename slug (no `.svg` extension). `icon-position` defaults to `left`; set it to `right` for forward-motion CTAs.

```html
<!-- Left icon (default) -->
<mds-button label="Aggiungi" icon="mi/baseline/add" variant="secondary" tone="weak"></mds-button>

<!-- Right icon -->
<mds-button label="Avanti" icon="mi/baseline/arrow-forward" icon-position="right" variant="primary"></mds-button>
```

## 5. Icon-Only Button

Omit `label` and provide `aria-label` (or `title`) explicitly. Without one, screen readers cannot announce the button's purpose.

```html
<mds-button icon="mi/baseline/delete" aria-label="Elimina elemento" variant="error" tone="text"></mds-button>
```

## 6. Hyperlink via `href`

Setting `href` switches the host to anchor semantics. Use `target="blank"` to open in a new tab; default is `self`.

```html
<mds-button label="Visita il sito" href="https://example.com" target="blank" variant="secondary" tone="outline"></mds-button>
```

## 7. Async Loading via `await`

Set the `await` boolean attribute while a request is in flight. The component renders an inline spinner, blocks activation, and reflects `aria-busy="true"`. Remove the attribute when done - do not set `await="false"`.

```html
<mds-button label="Salvataggio in corso..." await variant="primary"></mds-button>
```

## 8. Form Participation

`<mds-button>` is form-associated. Inside a `<form>` it natively triggers submit (`type="submit"`, default) or reset (`type="reset"`). Use `type="button"` for any action that must not submit the form.

```html
<form action="/save" method="post">
  <mds-input name="title" label="Titolo"></mds-input>

  <mds-button type="submit" label="Invia" variant="primary" tone="strong"></mds-button>
  <mds-button type="reset" label="Reimposta" variant="dark" tone="outline"></mds-button>
  <mds-button type="button" label="Anteprima" variant="secondary" tone="text"></mds-button>
</form>
```

## 9. Notification Badge via Named Slot

The `notification` slot accepts an `<mds-notification>`. This is the documented exception to the default-slot-is-text rule.

```html
<mds-button label="Notifiche" icon="mi/baseline/notifications" variant="secondary" tone="weak">
  <mds-notification slot="notification" value="12" variant="error"></mds-notification>
</mds-button>
```

## 10. SSO Identity Variants

`variant="google"` and `variant="apple"` apply the brand-correct chrome for SSO entry points. Do not reuse them for non-SSO buttons.

```html
<mds-button label="Accedi con Google" variant="google"></mds-button>
<mds-button label="Accedi con Apple" variant="apple"></mds-button>
```

## 11. Styling Customization

Style the button only through its documented `--mds-button-*` CSS custom properties. Set them on the host or a parent selector; use the Magma color tokens via `rgb(var(--<token>))` so dark mode and high-contrast modes keep working.

```css
.featured-action mds-button {
  --mds-button-background: rgb(var(--variant-primary-03));
  --mds-button-color: rgb(var(--tone-kaolin-10));
  --mds-button-radius: var(--radius-lg);
  --mds-button-gap: var(--spacing-300);
}
```
