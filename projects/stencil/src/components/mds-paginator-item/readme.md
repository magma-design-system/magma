# mds-paginator-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                    | Type      | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------ | --------- | ----------- |
| `active`   | `active`   | Specifies if the item is active or not, is handled from the parent paginator   | `boolean` | `undefined` |
| `disabled` | `disabled` | Specifies if the item is disabled or not, is handled from the parent paginator | `boolean` | `undefined` |
| `icon`     | `icon`     | Specifies the icon used inside the paginator item                              | `string`  | `undefined` |


## Dependencies

### Used by

 - [mds-paginator](../mds-paginator)

### Depends on

- [mds-icon](../mds-icon)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-paginator-item --> mds-icon
  mds-paginator-item --> mds-text
  mds-paginator --> mds-paginator-item
  style mds-paginator-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
