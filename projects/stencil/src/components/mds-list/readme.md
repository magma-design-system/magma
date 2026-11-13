# mds-list



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-list>` web component is the structural container of the Magma Design System list family. It is a thin compound parent that groups one or more `<mds-list-item>` children and replaces the native `<ul>`/`<ol>` primitive with an accessible, design-system-aware wrapper.

#### Semantic Behavior

- **List role**: Exposes the group as a semantic list to assistive technology regardless of the surrounding markup.
- **Compound parent**: Acts purely as the container; the visual rows (leading glyph and text) live in the slotted `<mds-list-item>` children.
- **Default slot is structural**: The default slot is meant to receive `<mds-list-item>` element(s) rather than free text.
- **The marker belongs to the list**: as `list-style` belongs to a `<ul>`, `marker` is set on the list and every item follows it, also an item added or moved into the list later.

#### Properties & Visual Configurations

- **`marker`** decides what the items are:
  - `dot` (the default): text items, each with a glyph before it (the `icon` of the item, a dot without it), indented by the room of the glyphs;
  - `none`: items that are links, cards or chips. No glyph, no indent, and each item takes any content and wraps it in nothing, so the page lays the items out with classes on the list: a column (the default grid, with a `gap-*`), a row that wraps (`flex flex-wrap`), a grid of cards (`grid-cols-*` under a container query). The `icon`, `typography` and `variant` of the items do not apply: the content brings its own. The list and its items keep the `list` and `listitem` roles.

Beyond `marker`, the list carries no `variant`, `tone`, `size` or text colour of its own: the items take the colour of the container, and a class such as `text-fg-muted` on `<mds-list>` makes the whole list secondary. All appearance and behavior are delegated to the slotted `<mds-list-item>` children. For the shared ladders that govern the children, see [`docs/agents/variants.md`](../../../../../../docs/agents/variants.md).


### 2. Examples

Correct and idiomatic ways to use the `<mds-list>` component, ordered from most common to most specialized. The examples assume a working knowledge of the typography scale documented in [`docs/agents/typography.md`](../../../../../../docs/agents/typography.md) and the shared component rules in [`docs/agents/conventions.md`](../../../../../../docs/agents/conventions.md).

#### Basic List

The canonical form. Place `<mds-list-item>` children directly inside `<mds-list>`. Each item renders a leading bullet glyph (the default list-dot icon) and the slotted text.

```html
<mds-list>
  <mds-list-item>Rinnova la licenza annuale</mds-list-item>
  <mds-list-item>Verifica i dati di fatturazione</mds-list-item>
  <mds-list-item>Scarica la ricevuta in PDF</mds-list-item>
</mds-list>
```

#### A Column of Links

With `marker="none"` the items hold components: a navigation list, the column of a footer. The text style comes from the `<mds-text>` around each link, which the link takes.

```html
<mds-text id="risorse" typography="h6" tag="h2">Risorse</mds-text>
<mds-list marker="none" aria-labelledby="risorse" class="gap-300">
  <mds-list-item>
    <mds-text typography="detail"><mds-link href="/componenti">Componenti</mds-link></mds-text>
  </mds-list-item>
  <mds-list-item>
    <mds-text typography="detail"><mds-link href="/token">Token</mds-link></mds-text>
  </mds-list-item>
</mds-list>
```

#### A Row of Chips

The classes of the list lay out the items: a row that wraps.

```html
<mds-list marker="none" class="flex flex-wrap gap-300">
  <mds-list-item><mds-chip label="Claude Code"></mds-chip></mds-list-item>
  <mds-list-item><mds-chip label="Cursor"></mds-chip></mds-list-item>
</mds-list>
```

#### A Grid of Cards

One card per item, in as many columns as the container gives room for. Steps in order keep their number in the content (the title of the card): the list draws none.

```html
<div class="@container">
  <mds-list marker="none" class="gap-600 @md:grid-cols-2 @3xl:grid-cols-3">
    <mds-list-item>
      <mds-card>
        <mds-card-header><mds-text typography="h6" tag="h3">1. Componenti</mds-text></mds-card-header>
        <mds-card-content><mds-text typography="detail">I componenti, uno per ruolo.</mds-text></mds-card-content>
      </mds-card>
    </mds-list-item>
    <mds-list-item>
      <mds-card>
        <mds-card-header><mds-text typography="h6" tag="h3">2. Blocchi</mds-text></mds-card-header>
        <mds-card-content><mds-text typography="detail">I blocchi, composti dai componenti.</mds-text></mds-card-content>
      </mds-card>
    </mds-list-item>
  </mds-list>
</div>
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

#### Adjusting the Icon Spacing

`<mds-list>` and `<mds-list-item>` have no public CSS custom property: the item aligns its icon to the text of its `typography` by itself. When a layout needs a different gap between icon and text, set it on the documented `::part(icon)` of `<mds-list-item>`; use Magma spacing tokens.

```css
.sidebar-checklist mds-list-item::part(icon) {
  margin-inline-end: calc(var(--spacing) * 300);
}
```

#### Shadow Part Customization

Reach the icon or text nodes through the documented `::part(icon)` and `::part(text)` parts of `<mds-list-item>`. Do not pierce the shadow DOM via `>>>` or undocumented selectors.

```css
/* Tint the leading icon of every item in a warning context */
.alert-list mds-list-item::part(icon) {
  fill: rgb(var(--magma-warning-fg));
}
```


### 3. Mistakes

Common incorrect uses of `<mds-list>` and `<mds-list-item>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/agents/mistakes.md`](../../../../../../docs/agents/mistakes.md) - they apply here too but are not repeated.

#### Do Not Replace `<mds-list>` with a Native `<ul>` or `<ol>`

Using a raw list element bypasses the design-system layout, typography defaults, and FOUC handling built into the component pair.

```html
<!-- INCORRECT -->
<ul>
  <li>Primo elemento</li>
  <li>Secondo elemento</li>
</ul>

<!-- CORRECT -->
<mds-list>
  <mds-list-item>Primo elemento</mds-list-item>
  <mds-list-item>Secondo elemento</mds-list-item>
</mds-list>
```

#### Do Not Put HTML Elements in the Default Slot of `<mds-list-item>`

In a list with the `dot` marker, the default slot of `<mds-list-item>` accepts a plain text string only: the item wraps it in its text, after the glyph, and HTML elements or components there break the layout. A list whose items are components takes `marker="none"`.

```html
<!-- INCORRECT -->
<mds-list>
  <mds-list-item>
    <strong>Allegato 1</strong> - Contratto firmato
  </mds-list-item>
</mds-list>

<!-- CORRECT -->
<mds-list>
  <mds-list-item>Allegato 1 - Contratto firmato</mds-list-item>
</mds-list>
```

#### Do Not Write a List of Links, Cards or Chips as a Native List

A native list with its markers removed loses its semantics in Safari, which reads a `list-style: none` list as no list unless it carries `role="list"`, and its items are laid out by hand. `marker="none"` keeps the roles and takes the layout from the classes of the list.

```html
<!-- INCORRECT -->
<ul class="m-0 flex list-none flex-col gap-300 p-0">
  <li><mds-link href="/componenti">Componenti</mds-link></li>
  <li><mds-link href="/token">Token</mds-link></li>
</ul>

<!-- CORRECT -->
<mds-list marker="none" class="gap-300">
  <mds-list-item><mds-link href="/componenti">Componenti</mds-link></mds-list-item>
  <mds-list-item><mds-link href="/token">Token</mds-link></mds-list-item>
</mds-list>
```

#### Do Not Use `<mds-list-item>` Outside `<mds-list>`

`<mds-list-item>` is a compound child designed to work exclusively inside `<mds-list>`. Using it standalone or wrapping it in a plain `<div>` breaks the accessible list context.

```html
<!-- INCORRECT -->
<div class="my-list">
  <mds-list-item>Voce autonoma</mds-list-item>
</div>

<!-- CORRECT -->
<mds-list>
  <mds-list-item>Voce autonoma</mds-list-item>
</mds-list>
```

#### Do Not Slot `<mds-icon>` to Override the Bullet

The `icon` prop on `<mds-list-item>` is the supported way to change the leading glyph. Slotting `<mds-icon>` into the default slot puts it inline in a text-only slot, misaligned, while the default bullet still renders.

```html
<!-- INCORRECT -->
<mds-list>
  <mds-list-item>
    <mds-icon name="mi/baseline/check"></mds-icon>
    Voce completata
  </mds-list-item>
</mds-list>

<!-- CORRECT -->
<mds-list>
  <mds-list-item icon="mi/baseline/check">Voce completata</mds-list-item>
</mds-list>
```

#### Do Not Add Non-Item Children Directly to `<mds-list>`

The default slot of `<mds-list>` is documented to receive `<mds-list-item>` elements. Mixing in headings, paragraphs, or other components breaks the expected structure and removes the semantic list context.

```html
<!-- INCORRECT -->
<mds-list>
  <mds-text typography="h6">Documenti richiesti</mds-text>
  <mds-list-item>Documento d'identita'</mds-list-item>
  <mds-list-item>Codice fiscale</mds-list-item>
</mds-list>

<!-- CORRECT -->
<mds-text typography="h6">Documenti richiesti</mds-text>
<mds-list>
  <mds-list-item>Documento d'identita'</mds-list-item>
  <mds-list-item>Codice fiscale</mds-list-item>
</mds-list>
```

#### Do Not Apply an Invalid `typography` Value to `<mds-list-item>`

`mds-list-item.typography` accepts `TypographyInfoType | TypographyReadType` - the allowed values are `caption`, `detail`, `label`, `option`, `paragraph`, and `tip`. Heading values such as `h1`-`h6` or `action` are outside the type and are not checked at runtime: the inner text renders the heading style next to a bullet aligned for body text.

```html
<!-- INCORRECT -->
<mds-list>
  <mds-list-item typography="h3">Titolo non valido</mds-list-item>
</mds-list>

<!-- CORRECT -->
<mds-list>
  <mds-list-item typography="paragraph">Testo valido</mds-list-item>
</mds-list>
```



## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                                                                                       | Type              | Default |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| `marker` | `marker`  | The marker of the items: `dot` draws a glyph before the text of each item (the `icon` of the item, a dot without it); `none` draws nothing and indents nothing, for a list whose items are links, cards or chips: each item then takes any content, and the page lays the items out (a column, a row that wraps, a grid) with classes on the list | `"dot" \| "none"` | `'dot'` |


## Slots

| Slot | Description                    |
| ---- | ------------------------------ |
|      | Add `mds-list-item` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
