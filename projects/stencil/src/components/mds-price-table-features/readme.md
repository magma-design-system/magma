# mds-price-table-features



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                              | Type                  | Default     |
| -------- | --------- | ---------------------------------------- | --------------------- | ----------- |
| `label`  | `label`   | Sets a header title for the entire table | `string \| undefined` | `undefined` |


## Slots

| Slot        | Description                                              |
| ----------- | -------------------------------------------------------- |
| `"default"` | Expects to slot `mds-price-table-features-row` component |


## Shadow Parts

| Part       | Description                                    |
| ---------- | ---------------------------------------------- |
| `"header"` | Selects the HTML element wrapper of label text |


## CSS Custom Properties

| Name                                 | Description                                      |
| ------------------------------------ | ------------------------------------------------ |
| `--mds-price-table-features-padding` | Sets the cell padding of the children components |


## Dependencies

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-price-table-features --> mds-text
  style mds-price-table-features fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
