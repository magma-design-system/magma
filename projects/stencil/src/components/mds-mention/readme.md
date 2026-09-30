# mds-mention



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-mention>` web component renders a compact inline chip that references a person or entity - the kind of token produced when you type `@name` in an editor or comment field. It pairs an icon, a text label, and a removable action into a single self-contained pill.

#### Semantic Behavior

- **Props-only**: It has no default slot and exposes its content exclusively through props.
- **Default icon**: When `icon` is not set the component falls back to the `alternate-email` (`@`) glyph, reinforcing the mention metaphor.
- **Opt-in remove affordance**: `deletable` adds a trailing remove button; its click emits `mdsMentionDelete`, and the component leaves the removal itself to the application.
- **Size-driven typography**: `size` maps to a fixed typography ramp (`sm` → `caption`, `md` → `detail`, `lg` → `h6`); the label is bold at `sm` and `md`, and normal weight at `lg`.

#### Properties & Visual Configurations

- **`deletable`** turns on the trailing remove button. Without it the mention is a read-only token: no button, no event.
- **`icon`** is an SVG filename slug from the Magma icon library, shown at the left of the label; omit it to keep the default `@` mention glyph.
- **`size`** controls both the physical scale and the typography of the label - pick `sm` for dense inline contexts, `lg` for prominent, headline-adjacent placements. Note that `size` also flips the label weight (bold below `lg`).


### 2. Pattern

Correct and idiomatic ways to use the `<mds-mention>` component, ordered from most common to most specialized. Patterns assume a working knowledge of the variant / tone ladders documented in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md) and the generic stencil rules in [`projects/stencil/SPEC.md`](../../../../SPEC.md).

#### Basic Inline Mention

The canonical form. Provide `label` with the user handle or display name. The component renders the default `@` glyph; the mention is read-only until `deletable` is set.

```html
<mds-text>
  Ciao <mds-mention label="mario.rossi"></mds-mention>, sei riuscito a inviare il messaggio?
</mds-text>
```

#### Removable Mention

Set `deletable` to show the remove button, then listen for `mdsMentionDelete` on the element. The
event carries the mention that was dismissed, so one handler can serve a whole list.

```html
<mds-mention id="m1" label="mario.rossi" deletable></mds-mention>
<script>
  document.querySelector('#m1').addEventListener('mdsMentionDelete', ({ detail }) => {
    detail.element.remove();
  });
</script>
```

#### Custom Icon

Override the default `@` glyph with any Magma icon slug via the `icon` prop. Use this when the mention refers to a team, group, or entity that has a dedicated icon.

```html
<mds-mention label="team-design" icon="mi/baseline/group"></mds-mention>
```

#### Sizing

Use the `size` prop to match the mention's visual weight to its context. `sm` is the default for dense inline use; `md` scales up the icon and typography; `lg` uses headline-weight typography for prominent placements.

```html
<!-- Dense list or comment thread -->
<mds-mention label="anna.verdi" size="sm"></mds-mention>

<!-- Standard body text -->
<mds-mention label="anna.verdi" size="md"></mds-mention>

<!-- Heading-adjacent or featured mention -->
<mds-mention label="anna.verdi" size="lg"></mds-mention>
```

#### Mention Inside a Comment or Message

Place `<mds-mention>` inline within `<mds-text>` to embed it naturally in body copy, preserving vertical alignment.

```html
<mds-text>
  Il documento e' stato approvato da
  <mds-mention label="lucia.ferrari" icon="mi/baseline/person"></mds-mention>
  e sara' pubblicato domani.
</mds-text>
```

#### Multiple Mentions in One Sentence

Drop several `<mds-mention>` tokens in the same text flow. Each is a self-contained pill; they line-wrap independently.

```html
<mds-text>
  <mds-mention label="marco.bianchi"></mds-mention> e
  <mds-mention label="giulia.conti"></mds-mention>
  sono stati assegnati alla revisione.
</mds-text>
```

#### Styling Customization

Adjust the icon size through the documented `--mds-mention-icon-size` CSS custom property. Set it on the host element or a parent selector; use Magma spacing tokens to stay on the design grid.

```css
.featured-comment mds-mention {
  --mds-mention-icon-size: var(--spacing-700);
}
```


### 3. Antipattern

Common incorrect uses of `<mds-mention>`. Each entry pairs the wrong form with the right one and a one-line reason. System-wide rules (boolean-as-string, shadow piercing, Tailwind color utilities, raw native event listening) live in [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md#system-level-anti-patterns) - they apply here too but are not repeated.

#### Do Not Slot Content Into the Component

`<mds-mention>` has no default slot and no named slots. Any child nodes placed inside the tag are silently ignored. Pass all content through the `label` and `icon` props.

```html
<!-- 🚫 INCORRECT -->
<mds-mention>
  <mds-icon name="mi/baseline/person"></mds-icon>
  mario.rossi
</mds-mention>

<!-- ✅ CORRECT -->
<mds-mention label="mario.rossi" icon="mi/baseline/person"></mds-mention>
```

#### Do Not Use a Raw `<span>` Chip Instead of the Component

Wrapping text in a styled `<span>` misses the remove affordance, icon handling, size ramp, and dark-mode token cascade. Use `<mds-mention>` whenever the UI needs an @-mention token.

```html
<!-- 🚫 INCORRECT -->
<span class="pill">@mario.rossi</span>

<!-- ✅ CORRECT -->
<mds-mention label="mario.rossi"></mds-mention>
```

#### Do Not Override Size with Inline CSS

The `size` prop drives icon dimensions, padding, and typography together as a coordinated unit. Setting `font-size`, `width`, or `height` inline breaks that coordination and can misalign the icon and label.

```html
<!-- 🚫 INCORRECT -->
<mds-mention label="anna.verdi" style="font-size: 20px; height: 40px;"></mds-mention>

<!-- ✅ CORRECT -->
<mds-mention label="anna.verdi" size="lg"></mds-mention>
```

#### Do Not Customize Style by Piercing the Shadow DOM

The only supported customization surface is `--mds-mention-icon-size`. Targeting internal elements via `>>>`, `/deep/`, or undocumented `::part()` names couples your code to implementation details and will break on minor releases.

```css
/* 🚫 INCORRECT */
mds-mention >>> mds-icon {
  width: 32px;
}

/* ✅ CORRECT */
mds-mention {
  --mds-mention-icon-size: var(--spacing-700);
}
```

#### Do Not Listen for `click` on the Remove Button Directly

The remove button lives inside the shadow DOM: a `click` listener on the host cannot tell it apart
from a click on the label, and reaching into the shadow root ties your code to an internal class
name. Listen for `mdsMentionDelete` instead - it is the contract, and it names the mention that was
dismissed.

```html
<!-- 🚫 INCORRECT -->
<mds-mention id="m1" label="marco.bianchi" deletable></mds-mention>
<script>
  document.querySelector('#m1').addEventListener('click', removeMention);
</script>

<!-- ✅ CORRECT -->
<mds-mention id="m1" label="marco.bianchi" deletable></mds-mention>
<script>
  document.querySelector('#m1').addEventListener('mdsMentionDelete', removeMention);
</script>
```



## Properties

| Property    | Attribute   | Description                                                     | Type                                | Default     |
| ----------- | ----------- | --------------------------------------------------------------- | ----------------------------------- | ----------- |
| `deletable` | `deletable` | Shows the cross icon to perform cancel/delete action on element | `boolean \| undefined`              | `undefined` |
| `icon`      | `icon`      | Sets the icon shown at the left of the label                    | `string \| undefined`               | `undefined` |
| `label`     | `label`     | Sets the label of the component                                 | `string \| undefined`               | `undefined` |
| `size`      | `size`      | Sets the label of the component                                 | `"lg" \| "md" \| "sm" \| undefined` | `'sm'`      |


## Events

| Event              | Description                                         | Type                           |
| ------------------ | --------------------------------------------------- | ------------------------------ |
| `mdsMentionDelete` | Emits when the component's delete button is clicked | `CustomEvent<MdsMentionEvent>` |


## CSS Custom Properties

| Name                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `--mds-mention-icon-size` | Sets the size (width and height) of the mention icon. |


## Dependencies

### Depends on

- [mds-icon](../mds-icon)
- [mds-text](../mds-text)
- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-mention --> mds-icon
  mds-mention --> mds-text
  mds-mention --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-mention fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
