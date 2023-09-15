# mds-kpi-item



<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute     | Description                                                  | Type                  | Default     |
| -------------------------- | ------------- | ------------------------------------------------------------ | --------------------- | ----------- |
| `description` _(required)_ | `description` | Specifies the description under the value in the KPI element | `string`              | `undefined` |
| `icon`                     | `icon`        | Specifies the icon on the top of the KPI element             | `string \| undefined` | `undefined` |
| `value` _(required)_       | `value`       | Specifies the number to be displayed in the KPI element      | `number`              | `undefined` |


## Slots

| Slot     | Description                         |
| -------- | ----------------------------------- |
| `"icon"` | Put the icon shown on the component |


## CSS Custom Properties

| Name                  | Description                           |
| --------------------- | ------------------------------------- |
| `--description-color` | Set the color of the description text |
| `--info-padding`      | Set the padding of the info text      |
| `--value-color`       | Set the color of the value text       |


## Dependencies

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-kpi-item --> mds-text
  style mds-kpi-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
