# mds-avatar-stack-item



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-avatar-stack-item>` web component is a compound child that represents a single avatar inside an [`<mds-avatar-stack>`](../../mds-avatar-stack), wrapping an internal `<mds-avatar>` so individual avatars can be overlapped, sized, and counted as a group rather than rendered standalone.

#### Semantic Behavior

- **Compound child only**: It must be a direct slot child of `<mds-avatar-stack>`; the parent collects its direct `mds-avatar-stack-item` children to compute overlap and overflow. It is not meant to be used standalone or mixed with other child types in the stack.
- **Parent-driven sizing**: The visual size of each item is governed by the parent's `size` (`sm` / `md` / `lg`), which selects the active size, border, and overlap-offset CSS custom properties — the child exposes no `size` prop of its own.
- **Overflow / count badge**: When `count` is set, the item renders as a numeric badge instead of a person. The parent uses this for the trailing "+N" indicator, auto-appending a `count` item computed as `total` minus the number of slotted items whenever `total` exceeds the slotted count.
- **Pass-through to mds-avatar**: It forwards `count`, `initials`, `src`, `tone`, and `variant` straight to its internal `<mds-avatar>`; it adds no events, state, focus, or ARIA of its own.
- **Initials override color**: When `initials` are shown (no image available), they take precedence over `tone` and `variant` so each user stays visually distinguishable within the stack.

#### Properties & Visual Configurations

The shared `tone` / `variant` ladders are defined in [`projects/stencil/SPEC.md`](../../../../SPEC.md#tone-and-variant-system); `tone` accepts only the minimal set (`weak` default, `strong`) and `variant` accepts the avatar color set.

- **`src`**: Use for the primary case — a real user photo. When absent the avatar falls back to `initials`, and only when neither is provided do `tone` / `variant` define the placeholder appearance.
- **`initials`**: Provide a short identifier when no image exists; prefer it over relying on color alone, since it both labels and visually separates users in a dense stack.
- **`count`**: Set only to render an explicit overflow badge manually. In most cases this is computed for you by the parent's `total`, so set it directly only when building the overflow indicator yourself.



## Properties

| Property   | Attribute  | Description                                                                                                                                          | Type                                                                                                                                                                                                         | Default     |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `count`    | `count`    | Specifies number of total avatars, the total number will be subtracted by the slotted ones                                                           | `number \| undefined`                                                                                                                                                                                        | `undefined` |
| `initials` | `initials` | The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others | `string \| undefined`                                                                                                                                                                                        | `undefined` |
| `src`      | `src`      | Specifies the path to the image                                                                                                                      | `string \| undefined`                                                                                                                                                                                        | `undefined` |
| `tone`     | `tone`     | Specifies the color tone of the component                                                                                                            | `"strong" \| "weak" \| undefined`                                                                                                                                                                            | `'weak'`    |
| `variant`  | `variant`  | Specifies the color variant of the component                                                                                                         | `"amaranth" \| "aqua" \| "blue" \| "error" \| "green" \| "info" \| "lime" \| "orange" \| "orchid" \| "primary" \| "purple" \| "red" \| "sky" \| "success" \| "violet" \| "warning" \| "yellow" \| undefined` | `undefined` |


## CSS Custom Properties

| Name                                             | Description                                              |
| ------------------------------------------------ | -------------------------------------------------------- |
| `--mds-avatar-stack-item-background`             | The background color of each avatar in the stack         |
| `--mds-avatar-stack-item-border`                 | Computed active border (based on selected size)          |
| `--mds-avatar-stack-item-count-background-color` | Background color of the count badge in the stack         |
| `--mds-avatar-stack-item-count-color`            | Text color for the count badge in the stack              |
| `--mds-avatar-stack-item-lg-border`              | Border width for large avatars                           |
| `--mds-avatar-stack-item-lg-offset`              | Overlap factor for large avatars (higher = more overlap) |
| `--mds-avatar-stack-item-lg-size`                | Size of large avatars in the stack                       |
| `--mds-avatar-stack-item-md-border`              | Border width for medium avatars                          |
| `--mds-avatar-stack-item-md-offset`              | Overlap factor for medium avatars                        |
| `--mds-avatar-stack-item-md-size`                | Size of medium avatars in the stack                      |
| `--mds-avatar-stack-item-offset`                 | Computed active offset (based on selected size)          |
| `--mds-avatar-stack-item-offset-margin`          | Computed margin for overlapping avatars                  |
| `--mds-avatar-stack-item-size`                   | Computed active size (based on selected size)            |
| `--mds-avatar-stack-item-sm-border`              | Border width for small avatars                           |
| `--mds-avatar-stack-item-sm-offset`              | Overlap factor for small avatars                         |
| `--mds-avatar-stack-item-sm-size`                | Size of small avatars in the stack                       |


## Dependencies

### Used by

 - [mds-avatar-stack](../mds-avatar-stack)

### Depends on

- [mds-avatar](../mds-avatar)

### Graph
```mermaid
graph TD;
  mds-avatar-stack-item --> mds-avatar
  mds-avatar --> mds-img
  mds-avatar --> mds-icon
  mds-img --> mds-icon
  mds-img --> mds-text
  mds-img --> mds-button
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-avatar-stack --> mds-avatar-stack-item
  style mds-avatar-stack-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
