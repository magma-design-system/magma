# mds-dropdown



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute        | Description                                                                           | Type                                                                                                                                                                              | Default     |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `arrow`               | `arrow`          | If set, the component will have an arrow pointing to the caller.                      | `boolean \| undefined`                                                                                                                                                            | `true`      |
| `arrowPadding`        | `arrow-padding`  | Sets the distance between arrow and dropdown margins.                                 | `number \| undefined`                                                                                                                                                             | `24`        |
| `autoPlacement`       | `auto-placement` | If set, the component will be placed automatically near it's caller.                  | `boolean \| undefined`                                                                                                                                                            | `false`     |
| `backdrop`            | `backdrop`       | Specifies if the component has a backdrop background                                  | `boolean \| undefined`                                                                                                                                                            | `false`     |
| `flip`                | `flip`           | Specifies the placement of the component if no space is available where it is placed. | `boolean \| undefined`                                                                                                                                                            | `false`     |
| `offset`              | `offset`         | Sets distance between the dropdown and the caller.                                    | `number \| undefined`                                                                                                                                                             | `24`        |
| `placement`           | `placement`      | Specifies where the component should be placed relative to the caller.                | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start" \| undefined` | `'bottom'`  |
| `shift`               | `shift`          | If set, the component will be kept inside the viewport.                               | `boolean \| undefined`                                                                                                                                                            | `true`      |
| `shiftPadding`        | `shift-padding`  | Sets a safe area distance between the dropdown and the viewport.                      | `number \| undefined`                                                                                                                                                             | `24`        |
| `smooth`              | `smooth`         | If set, the component will follow the caller smoothly, visible when the page scrolls. | `boolean \| undefined`                                                                                                                                                            | `true`      |
| `strategy`            | `strategy`       | Sets the CSS position strategy of the component.                                      | `"absolute" \| "fixed" \| undefined`                                                                                                                                              | `'fixed'`   |
| `target` _(required)_ | `target`         | Specifies the id of the caller element.                                               | `string`                                                                                                                                                                          | `undefined` |
| `visible`             | `visible`        | Specifies the visibility of the component.                                            | `boolean \| undefined`                                                                                                                                                            | `false`     |
| `zIndex`              | `z-index`        | Specifies the visibility of the component.                                            | `number \| undefined`                                                                                                                                                             | `1000`      |


## Events

| Event                | Description                             | Type                                  |
| -------------------- | --------------------------------------- | ------------------------------------- |
| `mdsDropdownChange`  | Emits when a modal is visible or hidden | `CustomEvent<MdsDropdownEventDetail>` |
| `mdsDropdownHide`    | Emits when a modal is hidden            | `CustomEvent<MdsDropdownEventDetail>` |
| `mdsDropdownVisible` | Emits when a modal is visible           | `CustomEvent<MdsDropdownEventDetail>` |


## CSS Custom Properties

| Name                              | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `--mds-dropdown-arrow-background` | Sets the fill color of the arrow.                  |
| `--mds-dropdown-background`       | Sets the background-color of the dropdown.         |
| `--mds-dropdown-drop-shadow`      | Sets the drop-shadow of the dropdown.              |
| `--mds-dropdown-duration`         | Sets the duration of the dropdown animation.       |
| `--mds-dropdown-ease`             | Sets the easing of the dropdown animation.         |
| `--mds-dropdown-transform-from`   | Sets the from animation transform of the dropdown. |
| `--mds-dropdown-transform-to`     | Sets the to animation transform of the dropdown.   |
| `--mds-dropdown-z-index`          | Sets the z-index of the component.                 |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
