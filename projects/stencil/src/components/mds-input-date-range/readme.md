# mds-input-date-range



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type     | Default |
| ----------- | ------------ | ----------- | -------- | ------- |
| `endDate`   | `end-date`   |             | `string` | `''`    |
| `startDate` | `start-date` |             | `string` | `''`    |


## Events

| Event               | Description | Type                                                   |
| ------------------- | ----------- | ------------------------------------------------------ |
| `dateRangeSelected` |             | `CustomEvent<{ startDate: string; endDate: string; }>` |


## Dependencies

### Depends on

- [mds-text](../mds-text)
- [mds-button](../mds-button)
- [mds-dropdown](../mds-dropdown)
- [mds-calendar](../mds-calendar)

### Graph
```mermaid
graph TD;
  mds-input-date-range --> mds-text
  mds-input-date-range --> mds-button
  mds-input-date-range --> mds-dropdown
  mds-input-date-range --> mds-calendar
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-calendar --> mds-button
  mds-calendar --> mds-calendar-cell
  mds-calendar-cell --> mds-button
  style mds-input-date-range fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
