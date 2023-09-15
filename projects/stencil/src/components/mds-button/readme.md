# mds-button



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                           | Type                                                                                         | Default     |
| -------------- | --------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| `active`       | `active`        | Specifies if the button is active or not                              | `boolean`                                                                                    | `undefined` |
| `await`        | `await`         | Specifies if the button is awaiting for a response                    | `boolean`                                                                                    | `undefined` |
| `disabled`     | `disabled`      | Specifies if the component is disabled or not                         | `boolean`                                                                                    | `undefined` |
| `href`         | `href`          | Specifies the URL target of the button                                | `string \| undefined`                                                                        | `undefined` |
| `icon`         | `icon`          | The icon displayed in the button                                      | `string \| undefined`                                                                        | `undefined` |
| `iconPosition` | `icon-position` | Specifies the horizontal position of the icon displayed in the button | `"left" \| "right" \| undefined`                                                             | `'left'`    |
| `size`         | `size`          | Specifies the size for the button                                     | `"lg" \| "md" \| "sm" \| "xl"`                                                               | `'md'`      |
| `target`       | `target`        | Specifies the target of the URL, if self or blank                     | `"blank" \| "self"`                                                                          | `'self'`    |
| `tone`         | `tone`          | Specifies the tone variant for the button                             | `"ghost" \| "quiet" \| "strong" \| "weak" \| undefined`                                      | `'strong'`  |
| `type`         | `type`          | The type of the button element                                        | `"a" \| "button" \| "reset" \| "submit" \| undefined`                                        | `'submit'`  |
| `variant`      | `variant`       | Specifies the color variant for the button                            | `"dark" \| "error" \| "info" \| "light" \| "primary" \| "success" \| "warning" \| undefined` | `'primary'` |


## Slots

| Slot             | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `"default"`      | Add `text string` to this slot, **avoid** to add `HTML elements` or `components` here.        |
| `"notification"` | Add `HTML elements` or `components`, it is **recommended** to use `mds-notification` element. |


## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"label"` |             |


## Dependencies

### Used by

 - [mds-tab-item](../mds-tab-item)

### Depends on

- [mds-spinner](../mds-spinner)
- [mds-icon](../mds-icon)
- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-tab-item --> mds-button
  style mds-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
