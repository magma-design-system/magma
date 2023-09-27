# mds-accordion


This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


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

Built with love @ **Maggioli Informatica / R&D Department**
