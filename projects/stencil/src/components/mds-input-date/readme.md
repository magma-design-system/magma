# mds-input-date



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default |
| -------- | --------- | ----------- | -------- | ------- |
| `value`  | `value`   |             | `string` | `''`    |


## Events

| Event         | Description | Type                  |
| ------------- | ----------- | --------------------- |
| `valueChange` |             | `CustomEvent<string>` |


## Methods

### `focusInput() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [mds-date-picker](../mds-date-picker)

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-input-date --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-date-picker --> mds-input-date
  style mds-input-date fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
