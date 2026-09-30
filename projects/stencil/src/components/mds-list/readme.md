# mds-list



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-list>` web component is the structural container of the Magma Design System list family. It is a thin compound parent that groups one or more `<mds-list-item>` children and replaces the native `<ul>`/`<ol>` primitive with an accessible, design-system-aware wrapper.

#### Semantic Behavior

- **List role**: Exposes the group as a semantic list to assistive technology regardless of the surrounding markup.
- **Compound parent**: Acts purely as the container; the visual rows, interaction, and per-item state live in the slotted `<mds-list-item>` children.
- **Default slot is structural**: The default slot is meant to receive `<mds-list-item>` element(s) rather than free text.

#### Properties & Visual Configurations

This component exposes no configurable props; it carries no `variant`, `tone`, or `size` of its own. All appearance and behavior are delegated to the slotted `<mds-list-item>` children. For the shared ladders that govern the children, see [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-list>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the typography scale documented in [`projects/stencil/SPEC.md`](../../../../SPEC.md) and the generic stencil rules in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md).

#### Basic List

The canonical form. Place `<mds-list-item>` children directly inside `<mds-list>`. Each item renders a leading bullet glyph (the default list-dot icon) and the slotted text.

```html
<mds-list>
  <mds-list-item>Rinnova la licenza annuale</mds-list-item>
  <mds-list-item>Verifica i dati di fatturazione</mds-list-item>
  <mds-list-item>Scarica la ricevuta in PDF</mds-list-item>
</mds-list>
```

#### Overriding the Item Icon

Pass an icon slug to `<mds-list-item>` via the `icon` prop to replace the default bullet with a meaningful glyph. Leave the prop unset to keep the standard dot.

```html
<mds-list>
  <mds-list-item icon="mi/baseline/check-circle">Profilo aggiornato</mds-list-item>
  <mds-list-item icon="mi/baseline/check-circle">Password modificata</mds-list-item>
  <mds-list-item icon="mi/baseline/pending">Verifica email in attesa</mds-list-item>
</mds-list>
```

#### Choosing the Typography Scale

Use the `typography` prop on each `<mds-list-item>` to match the visual density of the surrounding content. The default is `detail`; use `paragraph` for body-copy contexts and `caption` or `tip` for compact secondary lists.

```html
<!-- Body-copy density - long paragraphs nearby -->
<mds-list>
  <mds-list-item typography="paragraph">Seleziona il piano adatto alle tue esigenze</mds-list-item>
  <mds-list-item typography="paragraph">Inserisci i dati di pagamento</mds-list-item>
  <mds-list-item typography="paragraph">Conferma l'ordine e ricevi la ricevuta</mds-list-item>
</mds-list>

<!-- Compact secondary list -->
<mds-list>
  <mds-list-item typography="caption">Aggiornato il 01/06/2026</mds-list-item>
  <mds-list-item typography="caption">Versione 3.2.1</mds-list-item>
</mds-list>
```

#### Reading Variant for Long-Form Content

Set `variant="read"` when list items appear inside a reading-optimized context (article, tutorial, legal text). Use the default `variant="info"` for compact informational lists.

```html
<mds-list>
  <mds-list-item typography="paragraph" variant="read">
    Il servizio e' disponibile per tutti gli enti pubblici italiani
  </mds-list-item>
  <mds-list-item typography="paragraph" variant="read">
    L'accesso avviene tramite credenziali SPID o CIE
  </mds-list-item>
  <mds-list-item typography="paragraph" variant="read">
    I dati sono trattati in conformita' al GDPR
  </mds-list-item>
</mds-list>
```

#### Mixed Icon and Default Bullet in the Same List

You can mix items with an explicit `icon` and items that fall back to the default bullet within the same `<mds-list>`. Each item is independent.

```html
<mds-list>
  <mds-list-item icon="mi/baseline/warning">Modulo non compilato</mds-list-item>
  <mds-list-item>Campo facoltativo ignorato</mds-list-item>
  <mds-list-item icon="mi/baseline/error">Firma digitale mancante</mds-list-item>
</mds-list>
```

#### Styling Customization via CSS Custom Property

Adjust icon spacing through the documented `--mds-list-item-icon-margin` CSS custom property. Set it on the `<mds-list-item>` host or on a parent selector; use Magma spacing tokens.

```css
.sidebar-checklist mds-list-item {
  --mds-list-item-icon-margin: 0 var(--spacing-300) 0 0;
}
```

#### Shadow Part Customization

Reach the icon or text nodes through the documented `::part(icon)` and `::part(text)` parts of `<mds-list-item>` when CSS custom properties are insufficient. Do not pierce the shadow DOM via `>>>` or undocumented selectors.

```css
/* Tint the leading icon of every item in a warning context */
.alert-list mds-list-item::part(icon) {
  fill: rgb(var(--status-warning-05));
}
```


### 3. Antipattern

Common incorrect uses of `<mds-list>` and `<mds-list-item>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Replace `<mds-list>` with a Native `<ul>` or `<ol>`

Using a raw list element bypasses the design-system layout, typography defaults, and FOUC handling built into the component pair.

```html
<!-- 🚫 INCORRECT -->
<ul>
  <li>Primo elemento</li>
  <li>Secondo elemento</li>
</ul>

<!-- ✅ CORRECT -->
<mds-list>
  <mds-list-item>Primo elemento</mds-list-item>
  <mds-list-item>Secondo elemento</mds-list-item>
</mds-list>
```

#### Do Not Put HTML Elements in the Default Slot of `<mds-list-item>`

The default slot of `<mds-list-item>` accepts a plain text string only; placing HTML elements or other components there is explicitly discouraged in the component's API and can break layout and compound-component communication.

```html
<!-- 🚫 INCORRECT -->
<mds-list>
  <mds-list-item>
    <strong>Allegato 1</strong> - Contratto firmato
  </mds-list-item>
</mds-list>

<!-- ✅ CORRECT -->
<mds-list>
  <mds-list-item>Allegato 1 - Contratto firmato</mds-list-item>
</mds-list>
```

#### Do Not Use `<mds-list-item>` Outside `<mds-list>`

`<mds-list-item>` is a compound child designed to work exclusively inside `<mds-list>`. Using it standalone or wrapping it in a plain `<div>` breaks the accessible list context.

```html
<!-- 🚫 INCORRECT -->
<div class="my-list">
  <mds-list-item>Voce autonoma</mds-list-item>
</div>

<!-- ✅ CORRECT -->
<mds-list>
  <mds-list-item>Voce autonoma</mds-list-item>
</mds-list>
```

#### Do Not Slot `<mds-icon>` to Override the Bullet

The `icon` prop on `<mds-list-item>` is the supported way to change the leading glyph. Slotting `<mds-icon>` into the default slot puts it in a text-only slot where it is either stripped or visually broken.

```html
<!-- 🚫 INCORRECT -->
<mds-list>
  <mds-list-item>
    <mds-icon name="mi/baseline/check"></mds-icon>
    Voce completata
  </mds-list-item>
</mds-list>

<!-- ✅ CORRECT -->
<mds-list>
  <mds-list-item icon="mi/baseline/check">Voce completata</mds-list-item>
</mds-list>
```

#### Do Not Add Non-Item Children Directly to `<mds-list>`

The default slot of `<mds-list>` is documented to receive `<mds-list-item>` elements. Mixing in headings, paragraphs, or other components breaks the expected structure and removes the semantic list context.

```html
<!-- 🚫 INCORRECT -->
<mds-list>
  <mds-text typography="h6">Documenti richiesti</mds-text>
  <mds-list-item>Documento d'identita'</mds-list-item>
  <mds-list-item>Codice fiscale</mds-list-item>
</mds-list>

<!-- ✅ CORRECT -->
<mds-text typography="h6">Documenti richiesti</mds-text>
<mds-list>
  <mds-list-item>Documento d'identita'</mds-list-item>
  <mds-list-item>Codice fiscale</mds-list-item>
</mds-list>
```

#### Do Not Apply an Invalid `typography` Value to `<mds-list-item>`

`mds-list-item.typography` accepts `TypographyInfoType | TypographyReadType` - the allowed values are `caption`, `detail`, `label`, `option`, `paragraph`, and `tip`. Heading values such as `h1`-`h6` or `action` are not accepted and silently fall back to the default.

```html
<!-- 🚫 INCORRECT -->
<mds-list-item typography="h3">Titolo non valido</mds-list-item>

<!-- ✅ CORRECT -->
<mds-list-item typography="paragraph">Testo valido</mds-list-item>
```



## Slots

| Slot | Description                    |
| ---- | ------------------------------ |
|      | Add `mds-list-item` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
