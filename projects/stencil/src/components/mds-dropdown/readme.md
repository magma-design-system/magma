# mds-dropdown



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute        | Description                                                                           | Type                                                                                                                                                                 | Default     |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `arrow`               | `arrow`          | If set, the component will have an arrow pointing to the caller.                      | `boolean`                                                                                                                                                            | `true`      |
| `arrowPadding`        | `arrow-padding`  | Sets the distance between arrow and dropdown margins.                                 | `24`                                                                                                                                                                 | `24`        |
| `autoPlacement`       | `auto-placement` | If set, the component will be placed automatically near it's caller.                  | `boolean`                                                                                                                                                            | `false`     |
| `backdrop`            | `backdrop`       | Specifies if the component has a backdrop background                                  | `boolean`                                                                                                                                                            | `false`     |
| `flip`                | `flip`           | Specifies the placement of the component if no space is available where it is placed. | `boolean`                                                                                                                                                            | `false`     |
| `offset`              | `offset`         | Sets distance between the dropdown and the caller.                                    | `24`                                                                                                                                                                 | `24`        |
| `placement`           | `placement`      | Specifies where the component should be placed relative to the caller.                | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start"` | `'bottom'`  |
| `shift`               | `shift`          | If set, the component will be kept inside the viewport.                               | `boolean`                                                                                                                                                            | `true`      |
| `shiftPadding`        | `shift-padding`  | Sets a safe area distance between the dropdown and the viewport.                      | `24`                                                                                                                                                                 | `24`        |
| `smooth`              | `smooth`         | If set, the component will follow the caller smoothly, visible when the page scrolls. | `boolean`                                                                                                                                                            | `true`      |
| `strategy`            | `strategy`       | Sets the CSS position strategy of the component.                                      | `"absolute" \| "fixed"`                                                                                                                                              | `'fixed'`   |
| `target` _(required)_ | `target`         | Specifies the id of the caller element.                                               | `string`                                                                                                                                                             | `undefined` |
| `visible`             | `visible`        | Specifies the visibility of the component.                                            | `boolean`                                                                                                                                                            | `false`     |


## Events

| Event           | Description                  | Type                |
| --------------- | ---------------------------- | ------------------- |
| `closeDropdown` | Emits when a modal is closed | `CustomEvent<void>` |


## CSS Custom Properties

| Name                 | Description                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--background`       | Sets the background-color of the dropdown.                                                                                     |
| `--background-arrow` | Sets the fill color of the arrow.                                                                                              |
| `--drop-shadow`      | drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.1)); |
| `--duration`         | 0.5s;                                                                                                                          |
| `--ease`             | theme('transitionTimingFunction.out-expo');                                                                                    |
| `--transform-from`   | scale(0.9) translateY(-3%);                                                                                                    |
| `--transform-to`     | scale(1) translate(0, 0);                                                                                                      |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
