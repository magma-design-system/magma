# mds-tab



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Events

| Event          | Description                      | Type                             |
| -------------- | -------------------------------- | -------------------------------- |
| `mdsTabChange` | Emits when a children is changed | `CustomEvent<MdsTabEventDetail>` |


## Slots

| Slot        | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `"content"` | Add `HTML elements` or `components`, one per mds-tab-item added. |
| `"default"` | Add `mds-tab-item` element/s.                                    |


## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"contents"` |             |
| `"tabs"`     |             |


## CSS Custom Properties

| Name                        | Description                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--mds-tab-duration`        | Sets the animation duration on how the contents height is resized when the component switch from a content to another one        |
| `--mds-tab-timing-function` | Sets the animation timing function on how the contents height is resized when the component switch from a content to another one |


## Dependencies

### Used by

 - [mds-input-upload](../mds-input-upload)
 - [mds-pref-theme](../mds-pref-theme)

### Graph
```mermaid
graph TD;
  mds-input-upload --> mds-tab
  mds-pref-theme --> mds-tab
  style mds-tab fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
