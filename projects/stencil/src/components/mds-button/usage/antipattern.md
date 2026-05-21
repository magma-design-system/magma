Below are incorrect uses, anti-patterns, and bad practices for the `<mds-button>` component.

## 1. Do not slot elements

```html
<!-- WRONG: this will strip tags -->
<mds-button>
  <div>Click here</div>
</mds-button>

<!-- Right: this will render text correctly -->
<mds-button>
  Click here
</mds-button>
```



## 1. Do Not Pass Boolean Attributes as Strings
Never set `disabled="false"` or `await="false"`. In HTML/Stencil, a non-empty string is truthy, meaning the button will remain disabled/loading. Instead, completely remove the attribute.
```html
<!-- INCORRECT -->
<mds-button disabled="false" label="Clicca qui"></mds-button>
<mds-button await="false" label="Invia"></mds-button>

<!-- CORRECT -->
<mds-button label="Clicca qui"></mds-button>
```

## 2. Avoid Rich HTML Markup in the Default Slot
The default slot is reserved strictly for text content. Do not nest icons, spans, or complex layout divs inside it. Use properties for icons/labels or dedicated slots instead.
```html
<!-- INCORRECT -->
<mds-button>
  <img src="icon.svg" />
  <span>Download</span>
</mds-button>

<!-- CORRECT -->
<mds-button label="Download" icon="action-download"></mds-button>
```

## 3. Do Not Nest Button Inside an Anchor Link
If you need a button that acts as a hyperlink, use the `href` attribute directly on the component. Wrapping `<mds-button>` in `<a>` creates nested interactive controls which violate HTML accessibility specifications.
```html
<!-- INCORRECT -->
<a href="/login">
  <mds-button label="Accedi"></mds-button>
</a>

<!-- CORRECT -->
<mds-button label="Accedi" href="/login"></mds-button>
```

## 4. Avoid Custom CSS Overrides and Shadow Piercing
Do not attempt to style internal elements by targeting tags, classes, or shadow selectors like `::part()`. Use the documented CSS custom variables.
```css
/* INCORRECT */
mds-button >>> .text {
  font-weight: bold;
}
mds-button::part(label) {
  color: red;
}

/* CORRECT */
mds-button {
  --mds-button-color: red;
}
```

## 5. Never Use Icon-Only Buttons without Accessible Description
Screen readers will not know what an icon-only button does if there is no text. Always include `aria-label` or `title` when `label` is empty.
```html
<!-- INCORRECT -->
<mds-button icon="action-delete"></mds-button>

<!-- CORRECT -->
<mds-button icon="action-delete" aria-label="Elimina elemento"></mds-button>
```

## 6. Do Not Mix Multiple Icon Methods
Do not use standard HTML child elements for icons. Use the component's `icon` attribute.
```html
<!-- INCORRECT -->
<mds-button>
  <mds-icon name="action-add"></mds-icon>
  Aggiungi
</mds-button>

<!-- CORRECT -->
<mds-button label="Aggiungi" icon="action-add"></mds-button>
```
