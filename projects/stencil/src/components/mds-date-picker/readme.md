# mds-date-picker



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type     | Default |
| ----------- | ------------ | ----------- | -------- | ------- |
| `endDate`   | `end-date`   |             | `string` | `''`    |
| `startDate` | `start-date` |             | `string` | `''`    |


## Dependencies

### Depends on

- [mds-input-date-range](../mds-input-date-range)
- [mds-input-date](../mds-input-date)
- [mds-calendar](../mds-calendar)

### Graph
```mermaid
graph TD;
  mds-date-picker --> mds-input-date-range
  mds-date-picker --> mds-input-date
  mds-date-picker --> mds-calendar
  mds-input-date-range --> mds-text
  mds-input-date-range --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-input-date --> mds-button
  mds-calendar --> mds-button
  mds-calendar --> mds-calendar-cell
  mds-calendar-cell --> mds-button
  style mds-date-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
