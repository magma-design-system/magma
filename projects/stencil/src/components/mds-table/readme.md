# mds-table



This is a web-component from Maggioli Design System [Magma](https://magma.maggiolicloud.it), built with StencilJS, TypeScript, Storybook. It's based on the web-component standard and it's designed to be agnostic from the JavaScirpt framework you are using.

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                  | Type                   | Default     |
| ------------- | ------------- | ------------------------------------------------------------ | ---------------------- | ----------- |
| `interactive` | `interactive` | Specifies if the table row are higlighted on mouseover event | `boolean \| undefined` | `undefined` |


## Events

| Event                       | Description                                 | Type                   |
| --------------------------- | ------------------------------------------- | ---------------------- |
| `mdsTableInteractiveChange` | Dispatces when interactive property changes | `CustomEvent<boolean>` |


## Slots

| Slot        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `"default"` | Put `mds-table-header`, `mds-table-body`, `mds-table-footer` element/s. |


## CSS Custom Properties

| Name                                | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| `--mds-table-background`            | The background-color of the table                                |
| `--mds-table-body-background`       | The background-color of the table body                           |
| `--mds-table-body-background-hover` | The background-color of the table body when the mouse is over it |
| `--mds-table-border-color`          | The border-color of the table                                    |
| `--mds-table-border-width`          | The border-width of the table                                    |
| `--mds-table-cell-background`       | The background-color of the table cell                           |
| `--mds-table-cell-background-hover` | The background-color of the table cell when the mouse is over it |
| `--mds-table-cell-border-color`     | The border-color of the table cell                               |
| `--mds-table-cell-border-width`     | The border-width of the table cell                               |
| `--mds-table-cell-padding`          | The padding of the table cell                                    |


----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
