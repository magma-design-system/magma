# mds-file-preview



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute      | Description                                                                                                                                                              | Type                                                                                                                                                                                    | Default     |
| ----------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `deletable`             | `deletable`    | Enables the cross icon to perform cancel/delete action on element                                                                                                        | `boolean \| undefined`                                                                                                                                                                  | `undefined` |
| `description`           | `description`  | Overrides the default filetype description                                                                                                                               | `string \| undefined`                                                                                                                                                                   | `undefined` |
| `downloadable`          | `downloadable` | Enables the download icon to perform the related action on element                                                                                                       | `boolean \| undefined`                                                                                                                                                                  | `undefined` |
| `filename` _(required)_ | `filename`     | The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary                                                       | `string`                                                                                                                                                                                | `undefined` |
| `filesize`              | `filesize`     | The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically. | `string \| undefined`                                                                                                                                                                   | `undefined` |
| `icon`                  | `icon`         | The name of the icon or a base64 string to render it as an svg                                                                                                           | `string`                                                                                                                                                                                | `undefined` |
| `message`               | `message`      | Sets a feedback message related to the component                                                                                                                         | `string \| undefined`                                                                                                                                                                   | `undefined` |
| `src`                   | `src`          | The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image                                               | `string \| undefined`                                                                                                                                                                   | `undefined` |
| `suffix`                | `suffix`       | Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen                                                               | `ExtensionSuffixType \| undefined`                                                                                                                                                      | `undefined` |
| `truncate`              | `truncate`     | Truncates the filename shown                                                                                                                                             | `"all" \| "none" \| "word" \| undefined`                                                                                                                                                | `'word'`    |
| `variant`               | `variant`      | The variant of the component, is shown only if the message attribute is defined                                                                                          | `"amaranth" \| "aqua" \| "blue" \| "error" \| "green" \| "info" \| "lime" \| "orange" \| "orchid" \| "primary" \| "sky" \| "success" \| "violet" \| "warning" \| "yellow" \| undefined` | `undefined` |


## Events

| Event             | Description                                               | Type                                     |
| ----------------- | --------------------------------------------------------- | ---------------------------------------- |
| `mdsFileDelete`   | Emits when the component is removed, returning file infos | `CustomEvent<MdsFilePreviewEventDetail>` |
| `mdsFileDownload` | Emits when the component is clicked, returning file infos | `CustomEvent<MdsFilePreviewEventDetail>` |


## Shadow Parts

| Part     | Description |
| -------- | ----------- |
| `"card"` |             |


## Dependencies

### Used by

 - [mds-input-upload](../mds-input-upload)

### Depends on

- [mds-button](../mds-button)
- [mds-img](../mds-img)
- [mds-icon](../mds-icon)
- [mds-text](../mds-text)
- [mds-badge](../mds-badge)

### Graph
```mermaid
graph TD;
  mds-file-preview --> mds-button
  mds-file-preview --> mds-img
  mds-file-preview --> mds-icon
  mds-file-preview --> mds-text
  mds-file-preview --> mds-badge
  mds-button --> mds-spinner
  mds-button --> mds-icon
  mds-button --> mds-text
  mds-badge --> mds-text
  mds-input-upload --> mds-file-preview
  style mds-file-preview fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
