# mds-tree



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                       | Type                                                | Default        |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------- |
| `appearance`   | `appearance`    | Specifies if the branches depth decorations are visible.                                          | `"curved" \| "mixed" \| "simplified" \| "straight"` | `'simplified'` |
| `async`        | `async`         | Specifies the tree should be opened asynchronously when after the click, .                        | `boolean \| undefined`                              | `undefined`    |
| `expanded`     | `expanded`      | Specifies if the tree is expanded.                                                                | `boolean \| undefined`                              | `undefined`    |
| `icon`         | `icon`          | Specifies the icon of the element                                                                 | `"chevron" \| "folder"`                             | `'chevron'`    |
| `iconPosition` | `icon-position` | Specifies the icon position of the element                                                        | `"left" \| "right"`                                 | `'left'`       |
| `label`        | `label`         | Specifies the selector of the target element, this attribute is used with `querySelector` method. | `string`                                            | `undefined`    |
| `truncate`     | `truncate`      | Truncate the text of the element on one single line.                                              | `"all" \| "none" \| "word" \| undefined`            | `'all'`        |


## Methods

### `open() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `updateLang() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"actions"` |             |


## Dependencies

### Depends on

- [mds-button](../mds-button)

### Graph
```mermaid
graph TD;
  mds-tree --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  style mds-tree fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
