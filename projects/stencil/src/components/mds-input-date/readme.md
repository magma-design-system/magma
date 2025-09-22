# mds-input-date



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                                             | Type                                                                            | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------- |
| `delay`    | `delay`    | Specifies the delay in milliseconds before closing the calendar dropdown, if the value is 0 the dropdown will not close | `number`                                                                        | `500`       |
| `disabled` | `disabled` | If true, the element is displayed as disabled                                                                           | `boolean \| undefined`                                                          | `false`     |
| `max`      | `max`      | Specifies the max date of the range, user cannot set dates after this date                                              | `null \| string`                                                                | `null`      |
| `min`      | `min`      | Specifies the min date of the range, user cannot set dates before this date                                             | `null \| string`                                                                | `null`      |
| `readonly` | `readonly` | Specifies that the element is read-only                                                                                 | `boolean \| undefined`                                                          | `false`     |
| `required` | `required` | Specifies that the element must be filled out before submitting the form                                                | `boolean \| undefined`                                                          | `false`     |
| `value`    | `value`    | Specifies the value of the input                                                                                        | `string`                                                                        | `''`        |
| `variant`  | `variant`  | Sets the variant of the input field                                                                                     | `"ai" \| "error" \| "info" \| "primary" \| "success" \| "warning" \| undefined` | `'primary'` |


## Events

| Event                | Description | Type                  |
| -------------------- | ----------- | --------------------- |
| `mdsInputDateSelect` |             | `CustomEvent<string>` |


## Methods

### `focusInput() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setValue(value: string) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `value` | `string` |             |

#### Returns

Type: `Promise<void>`



### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part           | Description |
| -------------- | ----------- |
| `"input-date"` |             |


## CSS Custom Properties

| Name                                      | Description                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `--mds-input-date-background`             | Sets the background-color of the component                              |
| `--mds-input-date-field-background-empty` | Sets the color of the component when the value is empty or not valid    |
| `--mds-input-date-field-color-empty`      | Sets the color of the component when the value is empty or not valid    |
| `--mds-input-date-icon-color`             | Sets the icon color of the component                                    |
| `--mds-input-date-ring`                   | Sets the box-shadow of the component's input to perform the ring effect |
| `--mds-input-date-shadow`                 | Sets the box-shadow of the component's input                            |
| `--mds-input-date-variant-color`          | Sets the variant colors of the component                                |


## Dependencies

### Depends on

- [mds-button](../mds-button)
- [mds-input-tip](../mds-input-tip)
- [mds-input-tip-item](../mds-input-tip-item)
- [mds-dropdown](../mds-dropdown)
- [mds-calendar](../mds-calendar)

### Graph
```mermaid
graph TD;
  mds-input-date --> mds-button
  mds-input-date --> mds-input-tip
  mds-input-date --> mds-input-tip-item
  mds-input-date --> mds-dropdown
  mds-input-date --> mds-calendar
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-input-tip-item --> mds-text
  mds-calendar --> mds-button
  mds-calendar --> mds-calendar-cell
  mds-calendar-cell --> mds-button
  style mds-input-date fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
