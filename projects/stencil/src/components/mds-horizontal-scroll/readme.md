# mds-horizontal-scroll



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description                                                        | Type                                                                                             | Default     |
| ----------- | ----------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------- |
| `controls`  | `controls`  | Specifies the viewport which will display navigation controls      | `"all" \| "desktop" \| "large" \| "none" \| "tablet" \| "tv" \| "wide" \| "xlarge" \| undefined` | `'desktop'` |
| `scrollbar` | `scrollbar` | Specifies the box’s snap position as an alignment of its snap area | `boolean \| undefined`                                                                           | `undefined` |
| `snap`      | `snap`      | Specifies the box’s snap position as an alignment of its snap area | `"center" \| "end" \| "none" \| "start" \| undefined`                                            | `'start'`   |


## Slots

| Slot        | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `"default"` | Add `text string`, `HTML elements` or `components` to this slot. |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"content"` |             |


## Dependencies

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-horizontal-scroll --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-horizontal-scroll fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
