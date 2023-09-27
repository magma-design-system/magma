# mds-details



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                          | Type      | Default |
| -------- | --------- | ------------------------------------ | --------- | ------- |
| `opened` | `opened`  | Specifies if the component is opened | `boolean` | `false` |


## Events

| Event              | Description                        | Type                   |
| ------------------ | ---------------------------------- | ---------------------- |
| `mdsDetailsChange` | Emits when the component is opened | `CustomEvent<boolean>` |


## Slots

| Slot        | Description                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `"action"`  | Add `HTML elements` or `components`, it is **recommended** to use `mds-button` element.                           |
| `"default"` | Add `text string`, `HTML elements` or `components` to this slot.                                                  |
| `"icon"`    | Insert an icon image, it can be `HTML elements` or `components`, it is **recommended** to add `mds-icon` element. |
| `"title"`   | Add a `text string`, `HTML elements` or `components`, it is **recommended** to use `mds-text` element.            |


## Shadow Parts

| Part         | Description |
| ------------ | ----------- |
| `"contents"` |             |


## CSS Custom Properties

| Name                              | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `--mds-details-helper-icon-color` | Sets icon color of the helper icon of the component |
| `--mds-details-icon-color`        | Sets the icon color the component                   |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
