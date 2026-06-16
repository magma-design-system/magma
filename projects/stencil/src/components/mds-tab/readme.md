# mds-tab



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description                                                                             | Type                                      | Default        |
| ----------- | ----------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- |
| `animation` | `animation` | Sets the animation type of the selection transition between `mds-tab-item` elements     | `"fade" \| "slide" \| undefined`          | `'slide'`      |
| `direction` | `direction` | Sets if the component distributes item vertically or horzontally                        | `"horizontal" \| "vertical" \| undefined` | `'horizontal'` |
| `fill`      | `fill`      | Sets if the tab area should fill the entire width                                       | `boolean \| undefined`                    | `undefined`    |
| `overflow`  | `overflow`  | Sets if the tab area should show an inset shadow when the tabs overflows it's container | `boolean \| undefined`                    | `undefined`    |
| `scrollbar` | `scrollbar` | Shows the horizontal scrollbar to maximize accessibility                                | `boolean \| undefined`                    | `undefined`    |
| `size`      | `size`      | Sets the size of the component items nested inside it                                   | `"md" \| "sm" \| undefined`               | `undefined`    |


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

| Part         | Description                                                                               |
| ------------ | ----------------------------------------------------------------------------------------- |
| `"contents"` | Selects the container of the tabbed contents elements.                                    |
| `"slider"`   | Selects the slider element which is visible when attribute `animation` is set to `slide`. |
| `"tabs"`     | Selects the container of `mds-tab-item` list elements.                                    |


## Dependencies

### Used by

 - [mds-input-upload](../mds-input-upload)
 - [mds-pref-animation](../mds-pref-animation)
 - [mds-pref-consumption](../mds-pref-consumption)
 - [mds-pref-contrast](../mds-pref-contrast)
 - [mds-pref-language](../mds-pref-language)
 - [mds-pref-theme](../mds-pref-theme)

### Graph
```mermaid
graph TD;
  mds-input-upload --> mds-tab
  mds-pref-animation --> mds-tab
  mds-pref-consumption --> mds-tab
  mds-pref-contrast --> mds-tab
  mds-pref-language --> mds-tab
  mds-pref-theme --> mds-tab
  style mds-tab fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
