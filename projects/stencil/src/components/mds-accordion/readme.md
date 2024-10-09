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


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
