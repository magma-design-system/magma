# mds-table-header



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type                   | Default     |
| ------------ | ------------ | ----------- | ---------------------- | ----------- |
| `selectable` | `selectable` |             | `boolean \| undefined` | `undefined` |


## Methods

### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description                    |
| ----------- | ------------------------------ |
| `"default"` | Add `mds-table-row` element/s. |


## Dependencies

### Depends on

- [mds-table-cell](../mds-table-cell)
- [mds-input-switch](../mds-input-switch)
- [mds-table-header-cell](../mds-table-header-cell)

### Graph
```mermaid
graph TD;
  mds-table-header --> mds-table-cell
  mds-table-header --> mds-input-switch
  mds-table-header --> mds-table-header-cell
  mds-input-switch --> mds-icon
  mds-input-switch --> mds-text
  mds-table-header-cell --> mds-button
  mds-table-header-cell --> mds-text
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-table-header fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
