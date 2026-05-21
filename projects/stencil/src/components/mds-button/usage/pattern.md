Here are correct and recommended usage patterns for the `<mds-button>` component.

## 1. Text Button (Preferred Approach)

Use the `label` property to set the text content, rather than nesting text inside the slot.

```html
<mds-button label="Save preferences" variant="primary" tone="strong"></mds-button>
```

## 2. Text Button using Slot (Fallback)

If using the default slot, supply **only** a plain text string. Do not embed nested HTML elements.

```html
<mds-button variant="primary">Invia modulo</mds-buttonu>
```

## 3. Button with Icon
Reference icons by their filename slug (without the `.svg` suffix). Set position using `iconPosition`.
```html
<!-- Left icon (default) -->
<mds-button label="Aggiungi" icon="action-plus" variant="secondary" tone="weak"></mds-button>

<!-- Right icon -->
<mds-button label="Avanti" icon="arrow-right" icon-position="right" variant="primary" tone="strong"></mds-button>
```

## 4. Icon-Only Button (Accessible)
When using only an icon without label text, you must supply `aria-label` or `title` for screen readers.
```html
<mds-button icon="action-delete" aria-label="Elimina elemento" variant="error" tone="text"></mds-button>
```

## 5. Navigation Link Style
Provide an `href` prop to convert the button behavior to a hyperlink. Use `target="blank"` to open in a new tab.
```html
<mds-button label="Visita il sito" href="https://example.com" target="blank" variant="secondary" tone="outline"></mds-button>
```

## 6. Await (Loading) State
To show a loading state during asynchronous operations, set the `await` attribute. Remove the attribute when complete (do not set `await="false"`).
```html
<mds-button label="Caricamento..." await variant="primary"></mds-button>
```

## 7. Button with Notification Badge
Use the named `notification` slot to attach a notification indicator, such as `<mds-notification>`.
```html
<mds-button label="Messaggi" icon="communication-email" variant="secondary" tone="weak">
  <mds-notification slot="notification" count="5" variant="error"></mds-notification>
</mds-button>
```

## 8. Form Submission and Reset
Since `<mds-button>` is form-associated, nesting it in a form will naturally submit or reset form data.
```html
<form>
  <!-- Native submit button -->
  <mds-button type="submit" label="Invia modulo" variant="success"></mds-button>
  <!-- Native reset button -->
  <mds-button type="reset" label="Annulla" variant="light" tone="outline"></mds-button>
</form>
```

## 9. Visual Variations
Select appropriate tone and variant combinations according to importance.
```html
<!-- High importance action -->
<mds-button label="Salva" variant="primary" tone="strong"></mds-button>

<!-- Medium importance action -->
<mds-button label="Modifica" variant="secondary" tone="outline"></mds-button>

<!-- Low importance action -->
<mds-button label="Cancella" variant="error" tone="text"></mds-button>
```

## 10. Styling Customization
Always use CSS Custom Properties when customizing the button from outside.
```css
/* Customizing button aesthetics in your application stylesheet */
.custom-action-button {
  --mds-button-background: var(--mds-color-primary-600);
  --mds-button-color: var(--mds-color-white);
  --mds-button-radius: 8px;
}
```
