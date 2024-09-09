# mds-pref-language



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                   | Type                                                                                                                        | Default  |
| -------- | --------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| `set`    | `set`     | Specifies the preference mode | ``${Lowercase<string>}${Lowercase<string>}${Lowercase<string>}` \| `${Lowercase<string>}${Lowercase<string>}` \| undefined` | `'auto'` |


## Dependencies

### Depends on

- [mds-pref-language-nav](../mds-pref-language-nav)
- [mds-dropdown](../mds-dropdown)

### Graph
```mermaid
graph TD;
  mds-pref-language --> mds-pref-language-nav
  mds-pref-language --> mds-dropdown
  mds-pref-language-nav --> mds-text
  mds-pref-language-nav --> mds-tab
  mds-pref-language-nav --> mds-tab-item
  mds-tab-item --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-pref-language fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
