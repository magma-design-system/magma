# mds-flex-table

This component is **deprecated** in favor of [mds-table][mds-table].

[mds-table]: https://www.npmjs.com/package/@maggioli-design-system/mds-table

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                  | Type      | Default     |
| ------------- | ------------- | ------------------------------------------------------------ | --------- | ----------- |
| `interactive` | `interactive` | Specifies if the table row are higlighted on mouseover event | `boolean` | `undefined` |
| `template`    | `template`    | Specifies the template for flex children elements            | `string`  | `undefined` |


## Events

| Event                           | Description                                 | Type                   |
| ------------------------------- | ------------------------------------------- | ---------------------- |
| `mdsFlexTableInteractiveChange` | Dispatces when interactive property changes | `CustomEvent<boolean>` |
| `mdsFlexTableTemplateChange`    | Dispatces when template property changes    | `CustomEvent<string>`  |


## CSS Custom Properties

| Name                     | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `--background`           | The cell background-color of the table body                                          |
| `--background-hover`     | The background-color of the table body when the mouse go over the table body element |
| `--background-row-hover` | The cell background-color when the mouse go over the table row element               |
| `--border-color`         | The border color between table rows                                                  |
| `--cell-align-items`     | The cell vertical align, based on flex align-items CSS property                      |
| `--cell-padding`         | The cell padding used on table cell                                                  |
| `--radius`               | The radius of the table (header and footer excluded)                                 |
| `--shadow`               | The box-shadow used on the table (header and footer excluded)                        |


----------------------------------------------

Built with love @ **Maggioli Informatica / R&D Department**
