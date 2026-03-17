# mds-stepper-bar



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description                                                                                                           | Type                    | Default  |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------- |
| `itemsDone`  | `items-done` | Sets the current item to the given index: 0 is none done, 1 is the first item done, last number + 1 is all items done | `number`                | `1`      |
| `navigation` | `navigation` | Specifies the navigation type                                                                                         | `"none" \| "scrollbar"` | `'none'` |


## Events

| Event                 | Description                  | Type                                    |
| --------------------- | ---------------------------- | --------------------------------------- |
| `mdsStepperBarChange` | Emits when a step is changed | `CustomEvent<MdsStepperBarEventDetail>` |


## Slots

| Slot        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `"content"` | Add `HTML elements` or `components`, one per mds-stepper-bar-item added |
| `"default"` | Add `mds-tepper-bar-item` element/s.                                    |


## Shadow Parts

| Part         | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `"contents"` | Selects the `contents` container element wrapped in shadowDOM. |
| `"items"`    | Selects the `items` container element wrapped in shadowDOM.    |


## CSS Custom Properties

| Name                                | Description                        |
| ----------------------------------- | ---------------------------------- |
| `--mds-stepper-bar-scroll-behavior` | Sets the scroll-behavior animation |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
