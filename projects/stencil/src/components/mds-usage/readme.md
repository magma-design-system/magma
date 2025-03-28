# mds-usage



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                                         | Type                                 | Default     |
| --------- | --------- | ------------------------------------------------------------------- | ------------------------------------ | ----------- |
| `alias`   | `alias`   | Specifies the alias of the usage phrase on the top of the component | `string \| undefined`                | `undefined` |
| `variant` | `variant` | Specifies the delay when the tooltip will trigger                   | `"do" \| "dont" \| "info" \| "warn"` | `'info'`    |


## Methods

### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `"default"` | Add `text string`, `HTML elements` or `components` to this slot. |


## CSS Custom Properties

| Name                           | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `--mds-usage-badge-background` | Sets the badge background-color of the component. |
| `--mds-usage-badge-color`      | Sets the badge text color of the component.       |
| `--mds-usage-border-color`     | Sets the border color of the component.           |


## Dependencies

### Depends on

- [mds-badge](../mds-badge)

### Graph
```mermaid
graph TD;
  mds-usage --> mds-badge
  mds-badge --> mds-text
  style mds-usage fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
