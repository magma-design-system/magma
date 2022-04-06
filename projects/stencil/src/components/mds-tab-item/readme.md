# mds-tab-item



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                             | Type                                     | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------- | ---------------------------------------- | ----------- |
| `icon`         | `icon`          | The icon displayed in the tab item                                      | `string`                                 | `undefined` |
| `iconPosition` | `icon-position` | Specifies the horizontal position of the icon displayed in the tab item | `"left" \| "right"`                      | `'left'`    |
| `selected`     | `selected`      | Specifies if the tab item is selected or not                            | `boolean`                                | `undefined` |
| `size`         | `size`          | Specifies the size for the tab item                                     | `"lg" \| "md" \| "sm" \| "xl"`           | `'md'`      |
| `type`         | `type`          | The type of the tab item element                                        | `"a" \| "button" \| "reset" \| "submit"` | `'submit'`  |


## Events

| Event           | Description                         | Type                  |
| --------------- | ----------------------------------- | --------------------- |
| `selectedEvent` | Emits when the tab item is selected | `CustomEvent<string>` |


## Dependencies

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-tab-item --> mds-button
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-tab-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
