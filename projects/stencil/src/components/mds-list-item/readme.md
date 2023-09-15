# mds-list-item



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                 | Type                                                                   | Default     |
| ------------ | ------------ | ------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| `icon`       | `icon`       | Specifies the icon displayed in the element | `string \| undefined`                                                  | `undefined` |
| `typography` | `typography` | Specifies the typography of the element     | `"caption" \| "detail" \| "label" \| "option" \| "paragraph" \| "tip"` | `'detail'`  |
| `variant`    | `variant`    | Specifies the variant for `typography`      | `"info" \| "read" \| undefined`                                        | `'info'`    |


## Slots

| Slot        | Description                                                                            |
| ----------- | -------------------------------------------------------------------------------------- |
| `"default"` | Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here. |


## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"icon"` |             |
| `"text"` |             |


## Dependencies

### Depends on

- [mds-icon](../mds-icon)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-list-item --> mds-icon
  mds-list-item --> mds-text
  style mds-list-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
