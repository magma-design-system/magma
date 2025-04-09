# mds-calendar-cell



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                    | Type                                                              | Default        |
| ------------- | ------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | -------------- |
| `date`        | `date`        | Specifies the date of the cell                                 | `string \| undefined`                                             | `undefined`    |
| `disabled`    | `disabled`    | Specifies if the cell is disabled                              | `boolean \| undefined`                                            | `undefined`    |
| `month`       | `month`       | Specifies if the current month or a weekend                    | `"current" \| "other" \| "weekend" \| undefined`                  | `'current'`    |
| `orientation` | `orientation` | Specifies the selection orientation of the cell                | `"both" \| "horizontal" \| "vertical" \| undefined`               | `'horizontal'` |
| `preview`     | `preview`     | Specifies if the selection is a preview or the final selection | `boolean \| undefined`                                            | `false`        |
| `selection`   | `selection`   | Specifies the point of selection of the cell                   | `"end" \| "middle" \| "none" \| "single" \| "start" \| undefined` | `undefined`    |
| `today`       | `today`       | Specifies if the cell is today                                 | `boolean \| undefined`                                            | `undefined`    |


## Dependencies

### Used by

 - [mds-calendar](../mds-calendar)

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-calendar-cell --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-calendar --> mds-calendar-cell
  style mds-calendar-cell fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
