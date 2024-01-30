# mds-tab-item



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                             | Type                                                  | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| `icon`         | `icon`          | The icon displayed in the tab item                                      | `string \| undefined`                                 | `undefined` |
| `iconPosition` | `icon-position` | Specifies the horizontal position of the icon displayed in the tab item | `"left" \| "right" \| undefined`                      | `'left'`    |
| `selected`     | `selected`      | Specifies if the tab item is selected or not                            | `boolean \| undefined`                                | `undefined` |
| `size`         | `size`          | Specifies the size for the tab item                                     | `"lg" \| "md" \| "sm" \| "xl" \| undefined`           | `'md'`      |
| `type`         | `type`          | The type of the tab item element                                        | `"a" \| "button" \| "reset" \| "submit" \| undefined` | `'submit'`  |


## Events

| Event              | Description                         | Type                  |
| ------------------ | ----------------------------------- | --------------------- |
| `mdsTabItemSelect` | Emits when the tab item is selected | `CustomEvent<string>` |


## Slots

| Slot        | Description                          |
| ----------- | ------------------------------------ |
| `"default"` | Put text string here, avoid elements |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"button"` |             |


## Dependencies

### Used by

 - [mds-input-upload](../mds-input-upload)

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-tab-item --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-input-upload --> mds-tab-item
  style mds-tab-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
