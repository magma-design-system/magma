# mds-pref-language-item



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                                                                                                                        | Default     |
| -------- | --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `code`   | `code`    |             | ``${Lowercase<string>}${Lowercase<string>}${Lowercase<string>}` \| `${Lowercase<string>}${Lowercase<string>}` \| undefined` | `undefined` |


## Dependencies

### Depends on

- [mds-entity](../mds-entity)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-pref-language-item --> mds-entity
  mds-pref-language-item --> mds-text
  mds-entity --> mds-spinner
  mds-entity --> mds-avatar
  mds-avatar --> mds-img
  mds-avatar --> mds-icon
  mds-img --> mds-icon
  mds-img --> mds-text
  mds-img --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-pref-language-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
