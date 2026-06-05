# mds-zero



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-zero>` web component is the empty-state (zero-data) panel of the Magma Design System: a centered, vertically stacked layout that pairs an illustration, explanatory copy, and a call-to-action to guide users when a list, search, or section has no content to show. It is a pure structural container with no props - composition happens entirely through its slots.

#### Semantic Behavior

- **Three-zone layout**: The host stacks its content vertically and centered - the default slot (the visual) on top, the `content` zone in the middle, and the `action` zone in a footer at the bottom.
- **Default slot is the visual**: The unnamed default slot holds the illustration or image; it is meant for an `mds-img`/`img`, not text.
- **Content zone is centered text**: The `content` slot is centered and constrained by a max-width, so headings and descriptions read as a focused message block.
- **Action zone auto-centers children**: Elements placed in `slot="action"` are horizontally centered within the footer, so a single primary button sits centered by default.
- **Themed surface**: The host renders a neutral rounded surface that picks up theme, contrast, and reduced-motion preferences.

#### Properties & Visual Configurations

`<mds-zero>` exposes no props; all configuration is done through slot composition and one CSS custom property.

- **`content` vs. `action` slots**: Put the message (title + description, typically `mds-text`) in `slot="content"`, and the recovery action (typically a single `mds-button`) in `slot="action"`. Use the default slot only for the illustration.
- **`--mds-zero-contents-max-width`**: Caps the width of the centered text block (default `400px`) so long descriptions wrap into a balanced column rather than spanning the full panel.

The `contents` and `actions` shadow parts expose the two wrapper zones for consumers that need to override their layout from outside the shadow boundary.



## Slots

| Slot        | Description                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| `"action"`  | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.                    |
| `"content"` | Put text elements here,                                                                                    |
| `"default"` | Add `HTML elements` or `components` to this slot, it is **recommended** to use `mds-img` or `img` element. |


## Shadow Parts

| Part         | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `"actions"`  | Selects the wrapper of the elements with attribute `slot="action"`.  |
| `"contents"` | Selects the wrapper of the elements with attribute `slot="content"`. |


## CSS Custom Properties

| Name                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `--mds-zero-contents-max-width` | Set if the contents has a max width to be centered in the component |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
