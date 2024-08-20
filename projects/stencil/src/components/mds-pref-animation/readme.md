# mds-pref-animation



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                   | Type                                               | Default     |
| -------- | --------- | ----------------------------- | -------------------------------------------------- | ----------- |
| `mode`   | `mode`    | Specifies the preference mode | `"disabled" \| "enabled" \| "system" \| undefined` | `undefined` |


## Dependencies

### Depends on

- [mds-text](../mds-text)
- [mds-tab](../mds-tab)
- [mds-tab-item](../mds-tab-item)

### Graph
```mermaid
graph TD;
  mds-pref-animation --> mds-text
  mds-pref-animation --> mds-tab
  mds-pref-animation --> mds-tab-item
  mds-tab-item --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-pref-animation fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
