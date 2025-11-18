# mds-modal



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                                                                                                                                                                                                              | Type                                                                                                                              | Default     |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `animating`   | `animating`   | Specifies if the component is animating itself or not                                                                                                                                                                                                                                    | `"intro" \| "none" \| "outro" \| undefined`                                                                                       | `'none'`    |
| `animation`   | `animation`   | Specifies if the component is animating itself or not                                                                                                                                                                                                                                    | `"3d" \| "custom" \| "slide" \| undefined`                                                                                        | `'slide'`   |
| `backdrop`    | `backdrop`    | Specifies if the modal shows the backdrop                                                                                                                                                                                                                                                | `boolean \| undefined`                                                                                                            | `true`      |
| `interaction` | `interaction` | Specifies if the component can be closed with close button, or also if the backdrop background is cliccked. If `strict` is selected only the close button can dismiss the component via UI. If `relaxed` is selected the component can be dismissed also by cliccking the backdrop area. | `"relaxed" \| "strict"`                                                                                                           | `'relaxed'` |
| `opened`      | `opened`      | Specifies if the modal is opened or not                                                                                                                                                                                                                                                  | `boolean \| undefined`                                                                                                            | `false`     |
| `overflow`    | `overflow`    | Specifies if the component prevents the body from scrolling when modal window is opened                                                                                                                                                                                                  | `"auto" \| "manual"`                                                                                                              | `'auto'`    |
| `position`    | `position`    | Specifies the animation position of the modal window                                                                                                                                                                                                                                     | `"bottom" \| "bottom-left" \| "bottom-right" \| "center" \| "left" \| "right" \| "top" \| "top-left" \| "top-right" \| undefined` | `'center'`  |


## Events

| Event           | Description                                                                                                     | Type                |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ------------------- |
| `mdsModalClose` | Emits when a modal is closed                                                                                    | `CustomEvent<void>` |
| `mdsModalHide`  | Emits when a modal is totally invisible, can be useful to detach the component when it's hidden and gain memory | `CustomEvent<void>` |


## Methods

### `close() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `"bottom"`  | Contents that will be placed on bottom of the window. Add `text string`, `HTML elements` or `components` to this slot.     |
| `"default"` | Contents that will be placed in the center of the window. Add `text string`, `HTML elements` or `components` to this slot. |
| `"top"`     | Contents that will be placed on top of the window. Add `text string`, `HTML elements` or `components` to this slot.        |
| `"window"`  | Use directly a window component if you need it. Add `text string`, `HTML elements` or `components` to this slot.           |


## Shadow Parts

| Part             | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `"action-close"` | Selects the close button of the modal.                     |
| `"window"`       | Selects the default window element of the modal when used. |


## Dependencies

### Used by

 - [mds-header](../mds-header)
 - [mds-status-bar](../mds-status-bar)

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-modal --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-header --> mds-modal
  mds-status-bar --> mds-modal
  style mds-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
