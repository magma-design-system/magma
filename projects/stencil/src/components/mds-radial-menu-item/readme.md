# mds-radial-menu-item



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                         | Type                                                                                                                                       | Default     |
| --------- | --------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `icon`    | `icon`    | The icon displayed in the button                    | `string \| undefined`                                                                                                                      | `undefined` |
| `size`    | `size`    |                                                     | `"lg" \| "md" \| "sm" \| "xl"`                                                                                                             | `'lg'`      |
| `tone`    | `tone`    | Specifies the tone variant for the button           | `"ghost" \| "quiet" \| "strong" \| "weak" \| undefined`                                                                                    | `'weak'`    |
| `tooltip` | `tooltip` | The tooltip displayed when hovering over the button | `string \| undefined`                                                                                                                      | `undefined` |
| `variant` | `variant` | Specifies the color variant for the button          | `"ai" \| "apple" \| "dark" \| "error" \| "google" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning" \| undefined` | `'dark'`    |


## CSS Custom Properties

| Name                                                | Description                                          |
| --------------------------------------------------- | ---------------------------------------------------- |
| `--mds-radial-menu-item-transition-duration`        | Set the transition duration of the menu items        |
| `--mds-radial-menu-item-transition-timing-function` | Set the transition timing function of the menu items |


## Dependencies

### Depends on

- [mds-button](../mds-button)
- [mds-tooltip](../mds-tooltip)

### Graph
```mermaid
graph TD;
  mds-radial-menu-item --> mds-button
  mds-radial-menu-item --> mds-tooltip
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-tooltip --> mds-text
  style mds-radial-menu-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
