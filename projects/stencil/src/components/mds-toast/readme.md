# mds-toast

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                                                                                                  | Type                              | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ----------- |
| `duration` | `duration` | If set, specifies the visibility duration in milliseconds of the element inside the viewport, when the time is up the visible property will be set to false. | `number \| undefined`             | `5000`      |
| `tone`     | `tone`     | Sets the tone of the color variant                                                                                                                           | `"strong" \| "weak" \| undefined` | `'strong'`  |
| `variant`  | `variant`  | Sets the theme variant colors                                                                                                                                | `"dark" \| "light" \| undefined`  | `'light'`   |
| `visible`  | `visible`  | Specifies if toast is visible at the bottom or not                                                                                                           | `boolean \| undefined`            | `undefined` |


## Events

| Event           | Description                        | Type                |
| --------------- | ---------------------------------- | ------------------- |
| `mdsToastClose` | Emits when the accordion is opened | `CustomEvent<void>` |


## CSS Custom Properties

| Name           | Description                                |
| -------------- | ------------------------------------------ |
| `--background` | Sets the background-color of the component |
| `--color`      | Sets the text color of the component       |
| `--icon-color` | Sets the text color of the component       |
| `--shadow`     | Sets the box-shadow of the component       |


## Dependencies

### Depends on

- [mds-text](../mds-text)

### Graph
```mermaid
graph TD;
  mds-toast --> mds-text
  style mds-toast fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
