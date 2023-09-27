# mds-stepper-bar



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                                           | Type     | Default |
| ----------- | ------------ | --------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `itemsDone` | `items-done` | Sets the current item to the given index: 0 is none done, 1 is the first item done, last number + 1 is all items done | `number` | `1`     |


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

| Part         | Description |
| ------------ | ----------- |
| `"contents"` |             |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
