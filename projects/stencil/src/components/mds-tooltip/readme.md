# mds-tooltip



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute        | Description                                                                           | Type                                                                                                                                                                 | Default     |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `arrow`               | `arrow`          | If set, the component will have an arrow pointing to the caller.                      | `boolean`                                                                                                                                                            | `true`      |
| `autoPlacement`       | `auto-placement` | If set, the component will be placed automatically near it's caller.                  | `boolean`                                                                                                                                                            | `true`      |
| `flip`                | `flip`           | Specifies the placement of the component if no space is available where it is placed. | `boolean`                                                                                                                                                            | `true`      |
| `offset`              | `offset`         | Sets distance between the tooltip and the caller.                                     | `12`                                                                                                                                                                 | `12`        |
| `placement`           | `placement`      | Specifies where the component should be placed relative to the caller.                | `"bottom" \| "bottom-end" \| "bottom-start" \| "left" \| "left-end" \| "left-start" \| "right" \| "right-end" \| "right-start" \| "top" \| "top-end" \| "top-start"` | `'top'`     |
| `shift`               | `shift`          | If set, the component will be kept inside the viewport.                               | `boolean`                                                                                                                                                            | `true`      |
| `shiftPadding`        | `shift-padding`  | Sets a safe area distance between the tooltip and the viewport.                       | `12`                                                                                                                                                                 | `12`        |
| `strategy`            | `strategy`       | Sets the CSS position strategy of the component.                                      | `"absolute" \| "fixed"`                                                                                                                                              | `'fixed'`   |
| `target` _(required)_ | `target`         | Specifies the id of the caller element.                                               | `string`                                                                                                                                                             | `undefined` |
| `typography`          | `typography`     | Specifies the font typography of the element                                          | `"caption" \| "detail" \| "tip"`                                                                                                                                     | `'tip'`     |
| `visible`             | `visible`        | Specifies the visibility of the component.                                            | `boolean`                                                                                                                                                            | `false`     |


## CSS Custom Properties

| Name                 | Description                                       |
| -------------------- | ------------------------------------------------- |
| `--background`       | Sets the background-color of the tooltip.         |
| `--background-arrow` | Sets the fill color of the arrow.                 |
| `--delay`            | Sets the delay of the tooltip.                    |
| `--drop-shadow`      | Sets the drop-shadow of the tooltip.              |
| `--duration`         | Sets the duration of the tooltip animation.       |
| `--ease`             | Sets the easing of the tooltip animation.         |
| `--transform-from`   | Sets the from animation transform of the tooltip. |
| `--transform-to`     | Sets the to animation transform of the tooltip.   |


## Dependencies

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-tooltip --> mds-text
  style mds-tooltip fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
