# mds-stepper-bar-item



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute      | Description                                                                           | Type                                                                                                                                                                   | Default     |
| -------------------- | -------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `badge`              | `badge`        | Specifies if the badge status is displayed                                            | `boolean`                                                                                                                                                              | `undefined` |
| `current`            | `current`      | Specifies if the component is the current or not                                      | `boolean`                                                                                                                                                              | `false`     |
| `done`               | `done`         | Specifies if the component is checked or not                                          | `boolean`                                                                                                                                                              | `false`     |
| `icon` _(required)_  | `icon`         | Specifies the icon displayed of the component when is not checked or the current item | `string`                                                                                                                                                               | `undefined` |
| `iconChecked`        | `icon-checked` | Specifies the icon displayed of the component when is checked                         | `string \| undefined`                                                                                                                                                  | `this.icon` |
| `label` _(required)_ | `label`        | Specifies a short description of the component                                        | `string`                                                                                                                                                               | `undefined` |
| `step`               | `step`         | Specifies if the step is displayed                                                    | `boolean`                                                                                                                                                              | `undefined` |
| `typography`         | `typography`   | Specifies the typography of the element                                               | `"action" \| "caption" \| "detail" \| "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "hack" \| "label" \| "option" \| "paragraph" \| "snippet" \| "tip" \| undefined` | `'h6'`      |
| `value`              | `value`        | Specifies the value the component will return mdsStepperBarItemSelect event           | `string \| undefined`                                                                                                                                                  | `undefined` |


## Events

| Event                   | Description                          | Type                                        |
| ----------------------- | ------------------------------------ | ------------------------------------------- |
| `mdsStepperBarItemDone` | Emits when the accordion is selected | `CustomEvent<MdsStepperBarItemEventDetail>` |


## CSS Custom Properties

| Name                                             | Description                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `--mds-stepper-bar-item-color`                   | Sets the color of the text                                          |
| `--mds-stepper-bar-item-duaration`               | Sets the duration of the animation                                  |
| `--mds-stepper-bar-item-icon-background`         | Sets the background-color of the icon                               |
| `--mds-stepper-bar-item-icon-background-current` | Sets the background-color of the icon when the component is current |
| `--mds-stepper-bar-item-icon-background-done`    | Sets the background-color of the icon when the component is done    |
| `--mds-stepper-bar-item-icon-color`              | Sets the color of the icon                                          |
| `--mds-stepper-bar-item-icon-color-current`      | Sets the color of the icon when the component is current            |
| `--mds-stepper-bar-item-icon-color-done`         | Sets the color of the icon when the component is done               |
| `--mds-stepper-bar-item-icon-ring-size`          | Sets the size of the icon circle when the component is current      |
| `--mds-stepper-bar-item-min-width`               | Sets the minimum width of the component                             |
| `--mds-stepper-bar-item-progress-background`     | Sets the background color of the progress bar                       |
| `--mds-stepper-bar-item-progress-color`          | Sets the color of the progress bar                                  |
| `--mds-stepper-bar-item-progress-thickness`      | Sets the thickness of the progress bar                              |


## Dependencies

### Depends on

- [mds-badge](../mds-badge)
- [mds-icon](../mds-icon)
- [mds-progress](../mds-progress)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-stepper-bar-item --> mds-badge
  mds-stepper-bar-item --> mds-icon
  mds-stepper-bar-item --> mds-progress
  mds-stepper-bar-item --> mds-text
  mds-badge --> mds-text
  style mds-stepper-bar-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
