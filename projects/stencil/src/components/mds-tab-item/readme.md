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

| Event              | Description                         | Type                  |
| ------------------ | ----------------------------------- | --------------------- |
| `mdsTabItemSelect` | Emits when the tab item is selected | `CustomEvent<string>` |


## CSS Custom Properties

| Name                                 | Description                                              |
| ------------------------------------ | -------------------------------------------------------- |
| `--mds-tab-item-background`          | Sets the background color of the component               |
| `--mds-tab-item-background-hover`    | Sets the background when the mouse is over the component |
| `--mds-tab-item-background-selected` | Sets the background when the component is selected       |
| `--mds-tab-item-color`               | Sets the color of the component                          |
| `--mds-tab-item-color-hover`         | Sets the color when the mouse is over the component      |
| `--mds-tab-item-color-selected`      | Sets the color when the component is selected            |
| `--mds-tab-item-radius`              | Sets the border-radius of the component                  |
| `--mds-tab-item-shadow-selected`     | Sets the box-shadow when the component is selected       |


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
