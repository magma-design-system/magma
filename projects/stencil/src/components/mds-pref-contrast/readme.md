# mds-pref-contrast



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                   | Type                                                 | Default     |
| -------- | --------- | ----------------------------- | ---------------------------------------------------- | ----------- |
| `mode`   | `mode`    | Specifies the preference mode | `"more" \| "no-preference" \| "system" \| undefined` | `undefined` |


## Dependencies

### Depends on

- [mds-text](../mds-text)
- [mds-tab](../mds-tab)
- [mds-tab-item](../mds-tab-item)

### Graph
```mermaid
graph TD;
  mds-pref-contrast --> mds-text
  mds-pref-contrast --> mds-tab
  mds-pref-contrast --> mds-tab-item
  mds-tab-item --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-pref-contrast fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
