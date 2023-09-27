# mds-badge



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute            | Description                             | Type                                                                                                                                                                                            | Default     |
| ------------------- | -------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `tone`              | `tone`               | Sets the tone of the color variant      | `"quiet" \| "strong" \| "weak" \| undefined`                                                                                                                                                    | `'weak'`    |
| `typography`        | `typography`         | Specifies the typography of the element | `"caption" \| "detail" \| "label" \| "option" \| "paragraph" \| "tip"`                                                                                                                          | `'option'`  |
| `typographyVariant` | `typography-variant` | Specifies the variant for `typography`  | `"code" \| "info" \| "read" \| "title" \| undefined`                                                                                                                                            | `undefined` |
| `variant`           | `variant`            | Sets the theme variant colors           | `"amaranth" \| "aqua" \| "blue" \| "dark" \| "error" \| "green" \| "info" \| "light" \| "lime" \| "orange" \| "orchid" \| "sky" \| "success" \| "violet" \| "warning" \| "yellow" \| undefined` | `'green'`   |


## Slots

| Slot        | Description                                                                            |
| ----------- | -------------------------------------------------------------------------------------- |
| `"default"` | Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here. |


## CSS Custom Properties

| Name           | Description                                |
| -------------- | ------------------------------------------ |
| `--background` | Sets the background-color of the component |
| `--color`      | Sets the text color of the component       |
| `--radius`     | Sets the border-radius of the component    |


## Dependencies

### Used by

 - [mds-file](../mds-file)
 - [mds-stepper-bar-item](../mds-stepper-bar-item)

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-badge --> mds-text
  mds-file --> mds-badge
  mds-stepper-bar-item --> mds-badge
  style mds-badge fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
