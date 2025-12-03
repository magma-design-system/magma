# mds-stepper-bar-item



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

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

| Name                                               | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- |
| `--mds-stepper-bar-item-color`                     | Color of the stepper bar item text.                |
| `--mds-stepper-bar-item-duaration`                 | Duration of stepper bar item animations.           |
| `--mds-stepper-bar-item-icon-background`           | Default background color of stepper item icons.    |
| `--mds-stepper-bar-item-icon-background-current`   | Background color of the current stepper item icon. |
| `--mds-stepper-bar-item-icon-background-done`      | Background color of a completed stepper item icon. |
| `--mds-stepper-bar-item-icon-color`                | Default icon color.                                |
| `--mds-stepper-bar-item-icon-color-current`        | Icon color for the current stepper item.           |
| `--mds-stepper-bar-item-icon-color-done`           | Icon color for completed stepper items.            |
| `--mds-stepper-bar-item-icon-ring-color`           | Color of the icon ring.                            |
| `--mds-stepper-bar-item-icon-ring-separator-color` | Color of the ring separator.                       |
| `--mds-stepper-bar-item-icon-ring-separator-size`  | Size of the ring separator.                        |
| `--mds-stepper-bar-item-icon-ring-size`            | Size of the icon ring.                             |
| `--mds-stepper-bar-item-min-width`                 | Minimum width of a stepper item.                   |
| `--mds-stepper-bar-item-progress-background`       | Background color of the progress indicator.        |
| `--mds-stepper-bar-item-progress-color`            | Color of the progress indicator.                   |
| `--mds-stepper-bar-item-progress-thickness`        | Thickness of the progress indicator.               |


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
