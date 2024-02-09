# mds-button



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                           | Type                                                                                         | Default     |
| -------------- | --------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| `active`       | `active`        | Specifies if the button is active or not                              | `boolean`                                                                                    | `undefined` |
| `autoFocus`    | `auto-focus`    | Specifies if the component is focused when is loaded on the viewport  | `boolean`                                                                                    | `undefined` |
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

| Part      | Description                   |
| --------- | ----------------------------- |
| `"icon"`  | The icon inside the component |
| `"label"` |                               |


## CSS Custom Properties

| Name                          | Description                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--mds-button-await-duration` | Sets the duration of the rotation of the spinner await component                                         |
| `--mds-button-background`     | Sets the background-color of the component                                                               |
| `--mds-button-border-color`   | Sets the border-color of the component                                                                   |
| `--mds-button-color`          | Sets the text color of the component                                                                     |
| `--mds-button-gap`            | Sets the distance betwen element inside the components, use it instead of setting gap property directly. |
| `--mds-button-icon-color`     | Sets the icon color of the component                                                                     |
| `--mds-button-radius`         | Sets the border-radius of the component                                                                  |


## Dependencies

### Used by

 - [mds-banner](../mds-banner)
 - [mds-breadcrumb](../mds-breadcrumb)
 - [mds-chip](../mds-chip)
 - [mds-file-preview](../mds-file-preview)
 - [mds-header-bar](../mds-header-bar)
 - [mds-input](../mds-input)
 - [mds-input-upload](../mds-input-upload)
 - [mds-label](../mds-label)
 - [mds-modal](../mds-modal)
 - [mds-note](../mds-note)
 - [mds-push-notification](../mds-push-notification)
 - [mds-tab-item](../mds-tab-item)
 - [mds-url-view](../mds-url-view)

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
  mds-banner --> mds-button
  mds-breadcrumb --> mds-button
  mds-chip --> mds-button
  mds-file-preview --> mds-button
  mds-header-bar --> mds-button
  mds-input --> mds-button
  mds-input-upload --> mds-button
  mds-label --> mds-button
  mds-modal --> mds-button
  mds-note --> mds-button
  mds-push-notification --> mds-button
  mds-tab-item --> mds-button
  mds-url-view --> mds-button
  style mds-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
