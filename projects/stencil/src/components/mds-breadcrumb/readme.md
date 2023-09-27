# mds-breadcrumb



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                    | Type                   | Default |
| -------- | --------- | ---------------------------------------------- | ---------------------- | ------- |
| `back`   | `back`    | Choose to display or not the back arrow button | `boolean \| undefined` | `true`  |


## Events

| Event                 | Description                          | Type                                    |
| --------------------- | ------------------------------------ | --------------------------------------- |
| `mdsBreadcrumbChange` | Emits when the breadcrumb is changed | `CustomEvent<MdsBreadcrumbEventDetail>` |


## Slots

| Slot        | Description                          |
| ----------- | ------------------------------------ |
| `"default"` | Add `mds-breadcrumb-item` element/s. |


## CSS Custom Properties

| Name                                          | Description                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `--mds-breadcrumb-arrow-depth-color`          | Sets the color of the arrow icon that separates buttons                              |
| `--mds-breadcrumb-button-background`          | Sets the background color of the button                                              |
| `--mds-breadcrumb-button-background-current`  | Sets the background color of the button when it's active                             |
| `--mds-breadcrumb-button-background-disabled` | Sets the background color of the button when it's disabled, is used for arrow button |
| `--mds-breadcrumb-button-background-hover`    | Sets the background color of the button when the mouse is over it                    |
| `--mds-breadcrumb-button-color`               | Sets the text color of the button                                                    |
| `--mds-breadcrumb-button-color-current`       | Sets the text color of the button when it's active                                   |
| `--mds-breadcrumb-button-color-disabled`      | Sets the text color of the button when it's disabled, is used for arrow button       |
| `--mds-breadcrumb-button-color-hover`         | Sets the text color of the button when the mouse is over it                          |
| `--mds-breadcrumb-current-button-color`       | Sets the text color of the current depth button                                      |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
