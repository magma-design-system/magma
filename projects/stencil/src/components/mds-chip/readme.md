# mds-chip



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute      | Description                                                     | Type        | Default     |
| -------------------- | -------------- | --------------------------------------------------------------- | ----------- | ----------- |
| `clickable`          | `clickable`    | Adds ARIA support to the element if has interaction             | `boolean`   | `undefined` |
| `deletable`          | `deletable`    | Shows the cross icon to perform cancel/delete action on element | `boolean`   | `undefined` |
| `deleteLabel`        | `delete-label` | Shows the cross icon to perform cancel/delete action on element | `"Rimuovi"` | `'Rimuovi'` |
| `disabled`           | `disabled`     | Shows the cross icon to perform cancel/delete action on element | `boolean`   | `false`     |
| `icon`               | `icon`         | The icon displayed to the left of the component's label         | `string`    | `undefined` |
| `label` _(required)_ | `label`        | The label displayed to the right of the component's icon        | `string`    | `undefined` |


## Events

| Event        | Description                                         | Type                        |
| ------------ | --------------------------------------------------- | --------------------------- |
| `delete`     | Emits when the component's delete button is clicked | `CustomEvent<MdsChipEvent>` |
| `labelClick` | Emits when the component's label is clicked         | `CustomEvent<MdsChipEvent>` |


## Dependencies

### Depends on

- [mds-icon](../mds-icon)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-chip --> mds-icon
  mds-chip --> mds-text
  style mds-chip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
