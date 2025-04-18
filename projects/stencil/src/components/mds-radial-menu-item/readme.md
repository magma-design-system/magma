# mds-radial-menu-item



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                | Type                                                                                                                                       | Default     |
| --------- | --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `icon`    | `icon`    | The icon displayed in the button           | `string \| undefined`                                                                                                                      | `undefined` |
| `size`    | `size`    | Specifies the size for the button          | `"lg" \| "md" \| "sm" \| "xl"`                                                                                                             | `'lg'`      |
| `tone`    | `tone`    | Specifies the tone variant for the button  | `"ghost" \| "quiet" \| "strong" \| "weak" \| undefined`                                                                                    | `'weak'`    |
| `tooltip` | `tooltip` |                                            | `string \| undefined`                                                                                                                      | `undefined` |
| `variant` | `variant` | Specifies the color variant for the button | `"ai" \| "apple" \| "dark" \| "error" \| "google" \| "info" \| "light" \| "primary" \| "secondary" \| "success" \| "warning" \| undefined` | `'dark'`    |


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
