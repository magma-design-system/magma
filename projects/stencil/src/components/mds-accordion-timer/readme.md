# mds-accordion-timer



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                    | Type     | Default |
| ---------- | ---------- | ---------------------------------------------- | -------- | ------- |
| `duration` | `duration` | Sets the duration of the single accordion item | `number` | `10000` |


## Events

| Event                     | Description                                | Type                |
| ------------------------- | ------------------------------------------ | ------------------- |
| `mdsAccordionTimerChange` | Emits when the accordion changes it's item | `CustomEvent<void>` |


## Slots

| Slot        | Description                               |
| ----------- | ----------------------------------------- |
| `"default"` | Add `mds-accordion-timer-item` element/s. |


## CSS Custom Properties

| Name                                            | Description                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `--mds-accordion-timer-color`                   | Sets the text color of the component mds-accordion-timer-item                               |
| `--mds-accordion-timer-duration`                | Sets the transition duration of open/close animation of the mds-accordion-timer-item        |
| `--mds-accordion-timer-progress-bar-background` | Sets the background-color of the progress bar when the mds-accordion-timer-item is selected |
| `--mds-accordion-timer-progress-bar-color`      | Sets the color of the progress bar when the mds-accordion-timer-item is selected            |
| `--mds-accordion-timer-progress-bar-thickness`  | Sets thickness of the progress bar of the mds-accordion-timer-item                          |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
