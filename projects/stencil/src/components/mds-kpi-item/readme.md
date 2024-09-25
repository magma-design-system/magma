# mds-kpi-item



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property                   | Attribute     | Description                                                  | Type                  | Default     |
| -------------------------- | ------------- | ------------------------------------------------------------ | --------------------- | ----------- |
| `description` _(required)_ | `description` | Specifies the description under the value in the KPI element | `string`              | `undefined` |
| `icon`                     | `icon`        | Specifies the icon on the top of the KPI element             | `string \| undefined` | `undefined` |
| `value` _(required)_       | `value`       | Specifies the number to be displayed in the KPI element      | `number`              | `undefined` |


## Slots

| Slot     | Description                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| `"icon"` | Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element. |


## CSS Custom Properties

| Name                               | Description                           |
| ---------------------------------- | ------------------------------------- |
| `--mds-kpi-item-description-color` | Set the color of the description text |
| `--mds-kpi-item-info-padding`      | Set the padding of the info text      |
| `--mds-kpi-item-value-color`       | Set the color of the value text       |


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

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
