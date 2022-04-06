# mds-avatar



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                 | Type     | Default     |
| ---------- | ---------- | ----------------------------------------------------------- | -------- | ----------- |
| `initials` | `initials` | The user's inizials displayed if there's no image available | `string` | `undefined` |
| `src`      | `src`      | Specifies the path to the image                             | `string` | `undefined` |


## CSS Custom Properties

| Name                             | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `--background-color-pending`     | The background-color when an image is loading |
| `--background-color-placeholder` | The background-color of the placeholder icon  |
| `--color-placeholder`            | The color of the placeholder icon             |
| `--radius`                       | The border-radius of the element              |


## Dependencies

### Used by

 - [mds-entity](../mds-entity)

### Depends on

- [mds-text](../mds-text)
- [mds-img](../mds-img)

### Graph
```mermaid
graph TD;
  mds-avatar --> mds-text
  mds-avatar --> mds-img
  mds-entity --> mds-avatar
  style mds-avatar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
