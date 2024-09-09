# mds-progress



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description                                                            | Type                                                                            | Default                                   |
| ----------- | ----------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| `direction` | `direction` | Specifies the direction of the progress bar, if horizonatl or vertical | `"horizontal" \| "vertical" \| undefined`                                       | `'horizontal'`                            |
| `progress`  | `progress`  | A value between 0 and 1 that rapresents the status progress            | `number`                                                                        | `0`                                       |
| `steps`     | `steps`     | Sets the steps that can be pronounced by accessibility technologies    | `string`                                                                        | `'Inizio,Un quarto,Metà,Tre quarti,Fine'` |
| `variant`   | `variant`   | Sets the theme variant colors                                          | `"dark" \| "error" \| "info" \| "light" \| "primary" \| "success" \| "warning"` | `'primary'`                               |


## Dependencies

### Used by

 - [mds-accordion-timer-item](../mds-accordion-timer-item)
 - [mds-benchmark-bar](../mds-benchmark-bar)
 - [mds-input-upload](../mds-input-upload)
 - [mds-stepper-bar-item](../mds-stepper-bar-item)

### Graph
```mermaid
graph TD;
  mds-accordion-timer-item --> mds-progress
  mds-benchmark-bar --> mds-progress
  mds-input-upload --> mds-progress
  mds-stepper-bar-item --> mds-progress
  style mds-progress fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
