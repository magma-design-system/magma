# mds-accordion


This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Usage

### 1. Description

The `<mds-accordion>` web component is the compound container of the Magma Design System that groups and orchestrates a set of collapsible `<mds-accordion-item>` panels. It renders a bare default slot and acts purely as the coordination layer that decides which children are selected.

#### Semantic Behavior

- **Compound parent/child**: The default slot accepts only `<mds-accordion-item>` elements; the parent assigns each child a sequential `id` (`item-0`, `item-1`, …) on load so it can address them in its selection logic.
- **Single vs. multiple selection**: By default opening one item collapses the others. With `multiple` set, any number of children may stay open at once and selection state is reported as a comma-separated list of indices.
- **Selection enforcement**: The parent listens to each child's internal select/unselect events and rewrites every child's `selected` state to enforce the active selection mode.
- **Mandatory selection**: When `closable` is `false`, the user cannot collapse the currently open item by clicking it again — one panel always remains open.
- **Emitted event**: Emits `mdsAccordionChange` whenever the selected child set changes, carrying the live `children` NodeList and the `selected` index/indices as a string.
- **Accessibility**: ARIA wiring lives on the children — each `<mds-accordion-item>` exposes a `role="button"` trigger with `aria-expanded` and a `role="region"` content panel labelled by its trigger.

#### Properties & Visual Configurations

This component has no shared `variant` / `tone` / `size` props; its two booleans control selection semantics rather than appearance.

#### Other behavioral props

- **`multiple`** switches the group from accordion behavior (one panel at a time) to independent toggles, allowing several panels open simultaneously.
- **`closable`** governs whether the active panel can be dismissed; set it to `false` to force at least one panel to stay expanded at all times.

Per-panel presentation — the visible `label`, heading `typography`, and the slotted body content — is configured on each `<mds-accordion-item>` child, not on the accordion itself.



## Properties

| Property   | Attribute  | Description                                                | Type                   | Default |
| ---------- | ---------- | ---------------------------------------------------------- | ---------------------- | ------- |
| `closable` | `closable` | Specifies if an item can be closed by user                 | `boolean \| undefined` | `true`  |
| `multiple` | `multiple` | Choose if multiple siblings can be selected simultaneously | `boolean \| undefined` | `false` |


## Events

| Event                | Description                                            | Type                                   |
| -------------------- | ------------------------------------------------------ | -------------------------------------- |
| `mdsAccordionChange` | Emits when the component attribute selected is changed | `CustomEvent<MdsAccordionEventDetail>` |


## Slots

| Slot        | Description                         |
| ----------- | ----------------------------------- |
| `"default"` | Add `mds-accordion-item` element/s. |


## CSS Custom Properties

| Name                                 | Description                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `--mds-accordion-border-color`       | Sets the border-color of the component children mds-accordion-item                                    |
| `--mds-accordion-color`              | Sets the text-color of the component children mds-accordion-item                                      |
| `--mds-accordion-description-color`  | Sets the color of the always visible title description                                                |
| `--mds-accordion-duration`           | Sets the transition duration of the close/open animation of the component children mds-accordion-item |
| `--mds-accordion-padding-selected`   | Sets the vertical padding of the component children mds-accordion-item when it's selected             |
| `--mds-accordion-padding-unselected` | Sets the vertical padding of the component children mds-accordion-item when it's unselected           |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
