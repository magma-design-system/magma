# mds-input-date-range



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type     | Default |
| ----------- | ------------ | ----------- | -------- | ------- |
| `endDate`   | `end-date`   |             | `string` | `''`    |
| `startDate` | `start-date` |             | `string` | `''`    |


## Events

| Event                 | Description | Type                   |
| --------------------- | ----------- | ---------------------- |
| `buttonToggleEmitter` |             | `CustomEvent<boolean>` |


## Dependencies

### Used by

 - [mds-date-picker](../mds-date-picker)

### Depends on

- [mds-text](../mds-text)
- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-input-date-range --> mds-text
  mds-input-date-range --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-date-picker --> mds-input-date-range
  style mds-input-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
