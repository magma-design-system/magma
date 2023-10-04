# mds-file



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                                                | Type                               | Default     |
| ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------- |
| `description` | `description` | Overrides the default filetype description                                                                                 | `string \| undefined`              | `undefined` |
| `filename`    | `filename`    | The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary         | `string`                           | `undefined` |
| `preview`     | `preview`     | The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image | `string \| undefined`              | `undefined` |
| `suffix`      | `suffix`      | Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen                 | `ExtensionSuffixType \| undefined` | `undefined` |


## Events

| Event             | Description                                               | Type                              |
| ----------------- | --------------------------------------------------------- | --------------------------------- |
| `mdsFileDownload` | Emits when the component is clicked, returning file infos | `CustomEvent<MdsFileEventDetail>` |


## Dependencies

### Depends on

- [mds-icon](../mds-icon)
- [mds-text](../mds-text)
- [mds-badge](../mds-badge)

### Graph
```mermaid
graph TD;
  mds-file --> mds-icon
  mds-file --> mds-text
  mds-file --> mds-badge
  mds-badge --> mds-text
  style mds-file fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)
