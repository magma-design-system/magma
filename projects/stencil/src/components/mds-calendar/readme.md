# mds-calendar



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type     | Default     |
| ----------- | ------------ | ----------- | -------- | ----------- |
| `endDate`   | `end-date`   |             | `string` | `undefined` |
| `startDate` | `start-date` |             | `string` | `undefined` |


## Events

| Event          | Description | Type                                                   |
| -------------- | ----------- | ------------------------------------------------------ |
| `datesEmitter` |             | `CustomEvent<{ startDate: string; endDate: string; }>` |


## Methods

### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [mds-date-picker](../mds-date-picker)

### Depends on

- [mds-button](../mds-button)
- [mds-calendar-cell](../mds-calendar-cell)

### Graph
```mermaid
graph TD;
  mds-calendar --> mds-button
  mds-calendar --> mds-calendar-cell
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-calendar-cell --> mds-button
  mds-date-picker --> mds-calendar
  style mds-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
