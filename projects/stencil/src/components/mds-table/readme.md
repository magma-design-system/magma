# mds-table



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScript framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                   | Type                   | Default     |
| ------------- | ------------- | ------------------------------------------------------------- | ---------------------- | ----------- |
| `interactive` | `interactive` | Specifies if the table rows are higlighted on mouseover event | `boolean \| undefined` | `undefined` |
| `selectable`  | `selectable`  | Specifies if the table rows are selectable by a checkbox      | `boolean \| undefined` | `undefined` |
| `selection`   | `selection`   |                                                               | `boolean \| undefined` | `undefined` |


## Events

| Event                     | Description                                 | Type                                        |
| ------------------------- | ------------------------------------------- | ------------------------------------------- |
| `mdsTableSelectionChange` | Dispatces when interactive property changes | `CustomEvent<MdsTableSelectionEventDetail>` |


## Methods

### `selectAll(select?: boolean) => Promise<void>`

Selects all elements or none, works only if `selectable` is true.

#### Parameters

| Name     | Type      | Description |
| -------- | --------- | ----------- |
| `select` | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `updateSelection() => Promise<void>`

`internal` Updates the selection data event and emits it, it's used to avoid add event listener to the dom and lower performance, works only if `selectable` is true.

#### Returns

Type: `Promise<void>`




## Slots

| Slot        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `"default"` | Put `mds-table-header`, `mds-table-body`, `mds-table-footer` element/s. |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
