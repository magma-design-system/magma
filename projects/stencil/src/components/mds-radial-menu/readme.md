# mds-radial-menu



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                          | Type                                                                                                                                       | Default       |
| ------------- | ------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `angleEnd`    | `angle-end`   | Specifies the ending angle of the menu               | `number`                                                                                                                                   | `360`         |
| `angleStart`  | `angle-start` | Specifies the starting angle of the menu             | `number`                                                                                                                                   | `0`           |
| `backdrop`    | `backdrop`    | Specifies if the component has a backdrop background | `boolean \| undefined`                                                                                                                     | `false`       |
| `direction`   | `direction`   | Specifies the direction of the menu elements         | `"clockwise" \| "counterclockwise"`                                                                                                        | `'clockwise'` |
| `disc`        | `disc`        | Specifies if the menu has a disc beneath or not      | `boolean \| undefined`                                                                                                                     | `undefined`   |
| `icon`        | `icon`        | The icon displayed in the button                     | `string \| undefined`                                                                                                                      | `undefined`   |
| `interaction` | `interaction` | Specifies how to open the menu                       | `"click" \| "rightclick"`                                                                                                                  | `'click'`     |
| `opened`      | `opened`      | Specifies if the menu is opened or not               | `boolean \| undefined`                                                                                                                     | `undefined`   |
| `radius`      | `radius`      | Specifies the radius of the menu                     | `number`                                                                                                                                   | `5`           |
| `size`        | `size`        | Specifies the size for the button                    | `"lg" \| "md" \| "sm" \| "xl"`                                                                                                             | `'lg'`        |
| `tone`        | `tone`        | Specifies the tone variant for the button            | `"ghost" \| "quiet" \| "strong" \| "weak" \| undefined`                                                                                    | `'strong'`    |
| `variant`     | `variant`     | Specifies the color variant for the button           | `"ai" \| "apple" \| "dark" \| "error" \| "google" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning" \| undefined` | `'dark'`      |


## Shadow Parts

| Part            | Description |
| --------------- | ----------- |
| `"radial-menu"` |             |


## Dependencies

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-radial-menu --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-radial-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
