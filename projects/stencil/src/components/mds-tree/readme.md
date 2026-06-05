# mds-tree



<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-tree>` web component is the root container of the Magma Design System tree view, organizing a hierarchy of slotted `<mds-tree-item>` nodes into an expandable/collapsible structure. It owns no visual row of its own: it is a compound parent that configures, stacks, and propagates state to its children.

#### Semantic Behavior

- **Compound parent**: The default slot accepts only `<mds-tree-item>` elements; the tree itself renders nothing but the slot and acts as the configuration and coordination root for the hierarchy.
- **Depth seeding**: Its direct children are assigned `depth = 0`, so each branch can compute its own indentation downward from the root.
- **Cascading `expanded`**: Toggling `expanded` on the tree propagates the new value to every child item, opening or collapsing the whole hierarchy at once - except children marked `async`, which are left for on-demand resolution.
- **Cascading `toggle` and `truncate`**: Changing the toggle icon or the truncation mode on the tree pushes the value down to all descendant items so the whole tree stays visually consistent.
- **Async branches**: When `async` is set, branches are expected to resolve their children after the click rather than expanding from pre-rendered content; such items are excluded from the bulk `expanded` cascade.

#### Properties & Visual Configurations

- **`appearance`** controls whether the depth-indicating branch decorations (connector lines and dots) are drawn: `'depth'` shows the guide lines that visualize nesting; `'none'` removes them for a flat look.
- **`actions`** governs how per-item action controls are surfaced: `'auto'` reveals them on hover, `'visible'` keeps them always shown.
- **`toggle`** selects the expand/collapse glyph for every item - `'chevron'` for a generic disclosure arrow, `'folder'` for a file-explorer metaphor; **`togglePosition`** places that glyph at the `'left'` or `'right'` of the label.

#### Other behavioral props

- **`truncate`** sets how item labels overflow: `'word'` truncates the line, `'all'` clamps to multiple lines (paired with the `--mds-tree-line-clamp` custom property), `'none'` lets text wrap freely.
- **`expanded`** is the only mutable, reflected state prop; set it on the root to open or close the entire tree programmatically.



## Properties

| Property         | Attribute         | Description                                                                                       | Type                               | Default     |
| ---------------- | ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------- |
| `actions`        | `actions`         | Show actions on the every tree item on hover or by default.                                       | `"auto" \| "visible" \| undefined` | `'auto'`    |
| `appearance`     | `appearance`      | Specifies if the branches depth decorations are visible.                                          | `"depth" \| "none"`                | `'depth'`   |
| `async`          | `async`           | Specifies the tree should be opened asynchronously when after the click, .                        | `boolean \| undefined`             | `undefined` |
| `expanded`       | `expanded`        | Specifies if the tree is expanded.                                                                | `boolean \| undefined`             | `undefined` |
| `label`          | `label`           | Specifies the selector of the target element, this attribute is used with `querySelector` method. | `string`                           | `undefined` |
| `toggle`         | `toggle`          | Specifies the toggle icon of the element                                                          | `"chevron" \| "folder"`            | `'chevron'` |
| `togglePosition` | `toggle-position` | Specifies the toggle icon position of the element                                                 | `"left" \| "right"`                | `'left'`    |
| `truncate`       | `truncate`        | Truncate the text of the element on one single line.                                              | `"all" \| "none" \| "word"`        | `'word'`    |


## Slots

| Slot        | Description                    |
| ----------- | ------------------------------ |
| `"default"` | Add `mds-tree-item` element/s. |


## CSS Custom Properties

| Name                                                        | Description                                                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--mds-tree-actions-border-radius`                          | Sets the border-radius of the wrapper container of the actions.                                                        |
| `--mds-tree-actions-gap`                                    | Sets the gap between the actions.                                                                                      |
| `--mds-tree-branch-border-color`                            | Sets the border color of the tree branch.                                                                              |
| `--mds-tree-branch-border-size`                             | Sets the border size of the tree branch.                                                                               |
| `--mds-tree-branch-dot-default-color`                       | Sets the default color of the tree branch dot.                                                                         |
| `--mds-tree-branch-dot-expanded-color`                      | Sets the color of the tree branch dot when the item is expanded.                                                       |
| `--mds-tree-branch-use-rounded-border`                      | Sets the tree branch has rounded connectors or not, use it as a boolean value `true` or `false`.                       |
| `--mds-tree-label-default-background`                       | Sets the default text color of the icon used at the near right of the label.                                           |
| `--mds-tree-label-hover-background`                         | Sets the background-color of the label when the mouse is over the item.                                                |
| `--mds-tree-label-icon-default-color`                       | Sets the default text color of the icon used at the near right of the label.                                           |
| `--mds-tree-label-icon-hover-color`                         | Sets the text color of the icon used at the near right of the label when the mouse is over the item.                   |
| `--mds-tree-line-clamp`                                     | Sets the number of lines to show before truncating the text, it only works when attribute `truncate` is set to `all`.  |
| `--mds-tree-toggle-gap`                                     | Sets the gap between the toggle icon and the label.                                                                    |
| `--mds-tree-toggle-icon-async-background`                   | Sets the background-color of the icon when the attribute `async` is set.                                               |
| `--mds-tree-toggle-icon-async-color`                        | Sets the text color of the icon when the attribute `async` is set.                                                     |
| `--mds-tree-toggle-icon-chevron-default-background`         | Sets the background-color of the chevron icon when the item is collapsed.                                              |
| `--mds-tree-toggle-icon-chevron-default-color`              | Sets the text color of the chevron icon when the item is collapsed.                                                    |
| `--mds-tree-toggle-icon-chevron-expanded-background`        | Sets the background-color of the chevron icon when the item is expanded.                                               |
| `--mds-tree-toggle-icon-chevron-expanded-color`             | Sets the text color of the chevron icon when the item is expanded.                                                     |
| `--mds-tree-toggle-icon-folder-default-background`          | Sets the background-color of the folder icon when the item is collapsed.                                               |
| `--mds-tree-toggle-icon-folder-default-color`               | Sets the text color of the folder icon when the item is collapsed.                                                     |
| `--mds-tree-toggle-icon-folder-expanded-background`         | Sets the background-color of the folder icon when the item is expanded.                                                |
| `--mds-tree-toggle-icon-folder-expanded-color`              | Sets the text color of the folder icon when the item is expanded.                                                      |
| `--mds-tree-toggle-icon-position-right-default-background`  | Sets the background-color of the icon when the attribute `toggle-position` is set to `right`.                          |
| `--mds-tree-toggle-icon-position-right-default-color`       | Sets the text color of the icon when the attribute `toggle-position` is set to `right`.                                |
| `--mds-tree-toggle-icon-position-right-expanded-background` | Sets the background-color of the icon when the attribute `toggle-position` is set to `right` and the item is expanded. |
| `--mds-tree-toggle-icon-position-right-expanded-color`      | Sets the text color of the icon when the attribute `toggle-position` is set to `right` and the item is expanded.       |
| `--mds-tree-transition-duration`                            | Sets the duration of the transition effect.                                                                            |
| `--mds-tree-transition-timing-function`                     | Sets the timing function of the transition effect.                                                                     |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
